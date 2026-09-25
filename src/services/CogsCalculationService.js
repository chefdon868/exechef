const { Revenue, Procurement, Setting, Alert, Outlet } = require('../models');
const { Op } = require('sequelize');

/**
 * Service for COGs calculations and analysis
 */
class CogsCalculationService {
  /**
   * Calculate COGs for a specific outlet and date
   * @param {number} outletId - Outlet ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Calculation results
   */
  async calculateDailyCogsForOutlet(outletId, date) {
    try {
      // Get outlet
      const outlet = await Outlet.findByPk(outletId);
      if (!outlet) {
        throw new Error(`Outlet with ID ${outletId} not found`);
      }

      // Get outlet settings
      const settings = await Setting.findOne({ where: { outletId } });
      if (!settings) {
        throw new Error(`Settings for outlet ${outlet.name} not found`);
      }

      // Get revenue data for the date
      const revenueData = await Revenue.findAll({
        where: {
          outletId,
          date
        },
        attributes: [
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('amount')), 'totalRevenue']
        ],
        raw: true
      });

      // Get procurement data for the date
      const procurementData = await Procurement.findAll({
        where: {
          outletId,
          date
        },
        attributes: [
          [Procurement.sequelize.fn('SUM', Procurement.sequelize.col('totalCost')), 'totalCost']
        ],
        raw: true
      });

      // Calculate COGs
      const totalRevenue = parseFloat(revenueData[0]?.totalRevenue || 0);
      const totalCost = parseFloat(procurementData[0]?.totalCost || 0);
      
      // Avoid division by zero
      const cogsPercentage = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;

      // Calculate adjusted target based on revenue
      const adjustedTarget = this._calculateAdjustedTarget(
        totalRevenue,
        settings.targetPercentage,
        settings.lowerThreshold,
        settings.lowerAdjustment,
        settings.upperThreshold,
        settings.upperAdjustment
      );

      // Calculate variance (positive means under target, negative means over target)
      const variance = adjustedTarget - cogsPercentage;

      // Determine status
      const status = cogsPercentage <= adjustedTarget ? 'WITHIN TARGET' : 'OVER TARGET';

      // Create or update alert if over target
      if (status === 'OVER TARGET') {
        await this._createOrUpdateAlert(outletId, date, cogsPercentage, adjustedTarget, variance, status);
      }

      return {
        outlet: outlet.name,
        date,
        revenue: totalRevenue,
        cost: totalCost,
        cogsPercentage,
        standardTarget: settings.targetPercentage,
        adjustedTarget,
        variance,
        status
      };
    } catch (error) {
      console.error('Error calculating COGs:', error);
      throw error;
    }
  }

  /**
   * Calculate COGs for all outlets for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Calculation results for all outlets
   */
  async calculateDailyCogsForAllOutlets(date) {
    try {
      // Get all outlets
      const outlets = await Outlet.findAll();
      
      // Calculate COGs for each outlet
      const results = [];
      for (const outlet of outlets) {
        try {
          const result = await this.calculateDailyCogsForOutlet(outlet.id, date);
          results.push(result);
        } catch (error) {
          console.error(`Error calculating COGs for outlet ${outlet.name}:`, error);
          // Continue with other outlets even if one fails
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error calculating COGs for all outlets:', error);
      throw error;
    }
  }

  /**
   * Calculate COGs for a date range
   * @param {number} outletId - Outlet ID
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Calculation results for date range
   */
  async calculateCogsForDateRange(outletId, startDate, endDate) {
    try {
      // Get outlet
      const outlet = await Outlet.findByPk(outletId);
      if (!outlet) {
        throw new Error(`Outlet with ID ${outletId} not found`);
      }

      // Get outlet settings
      const settings = await Setting.findOne({ where: { outletId } });
      if (!settings) {
        throw new Error(`Settings for outlet ${outlet.name} not found`);
      }

      // Get revenue data for the date range
      const revenueData = await Revenue.findAll({
        where: {
          outletId,
          date: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: [
          'date',
          [Revenue.sequelize.fn('SUM', Revenue.sequelize.col('amount')), 'totalRevenue']
        ],
        group: ['date'],
        order: [['date', 'ASC']],
        raw: true
      });

      // Get procurement data for the date range
      const procurementData = await Procurement.findAll({
        where: {
          outletId,
          date: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: [
          'date',
          [Procurement.sequelize.fn('SUM', Procurement.sequelize.col('totalCost')), 'totalCost']
        ],
        group: ['date'],
        order: [['date', 'ASC']],
        raw: true
      });

      // Combine data by date
      const dateMap = new Map();
      
      // Add revenue data to map
      revenueData.forEach(item => {
        dateMap.set(item.date, {
          date: item.date,
          revenue: parseFloat(item.totalRevenue || 0),
          cost: 0
        });
      });
      
      // Add procurement data to map
      procurementData.forEach(item => {
        if (dateMap.has(item.date)) {
          const entry = dateMap.get(item.date);
          entry.cost = parseFloat(item.totalCost || 0);
        } else {
          dateMap.set(item.date, {
            date: item.date,
            revenue: 0,
            cost: parseFloat(item.totalCost || 0)
          });
        }
      });

      // Calculate COGs for each date
      const results = [];
      for (const [date, data] of dateMap.entries()) {
        const cogsPercentage = data.revenue > 0 ? (data.cost / data.revenue) * 100 : 0;
        
        // Calculate adjusted target based on revenue
        const adjustedTarget = this._calculateAdjustedTarget(
          data.revenue,
          settings.targetPercentage,
          settings.lowerThreshold,
          settings.lowerAdjustment,
          settings.upperThreshold,
          settings.upperAdjustment
        );

        // Calculate variance
        const variance = adjustedTarget - cogsPercentage;

        // Determine status
        const status = cogsPercentage <= adjustedTarget ? 'WITHIN TARGET' : 'OVER TARGET';

        results.push({
          outlet: outlet.name,
          date,
          revenue: data.revenue,
          cost: data.cost,
          cogsPercentage,
          standardTarget: settings.targetPercentage,
          adjustedTarget,
          variance,
          status
        });
      }

      // Sort results by date
      results.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return results;
    } catch (error) {
      console.error('Error calculating COGs for date range:', error);
      throw error;
    }
  }

  /**
   * Calculate trend analysis for an outlet
   * @param {number} outletId - Outlet ID
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Object>} Trend analysis results
   */
  async calculateTrendAnalysis(outletId, days = 7) {
    try {
      // Get outlet
      const outlet = await Outlet.findByPk(outletId);
      if (!outlet) {
        throw new Error(`Outlet with ID ${outletId} not found`);
      }

      // Calculate end date (today) and start date
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Format dates for database query
      const formattedEndDate = endDate.toISOString().split('T')[0];
      const formattedStartDate = startDate.toISOString().split('T')[0];

      // Get COGs data for the date range
      const cogsData = await this.calculateCogsForDateRange(
        outletId,
        formattedStartDate,
        formattedEndDate
      );

      // Calculate 7-day rolling average
      const rollingAverage = cogsData.length > 0
        ? cogsData.reduce((sum, item) => sum + item.cogsPercentage, 0) / cogsData.length
        : 0;

      // Determine trend direction
      let trendDirection = 'stable';
      if (cogsData.length >= 3) {
        const firstHalf = cogsData.slice(0, Math.floor(cogsData.length / 2));
        const secondHalf = cogsData.slice(Math.floor(cogsData.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.cogsPercentage, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.cogsPercentage, 0) / secondHalf.length;
        
        const difference = secondHalfAvg - firstHalfAvg;
        
        if (difference > 1) {
          trendDirection = 'increasing';
        } else if (difference < -1) {
          trendDirection = 'decreasing';
        }
      }

      // Calculate performance metrics
      const daysOverTarget = cogsData.filter(item => item.status === 'OVER TARGET').length;
      const percentageOverTarget = cogsData.length > 0
        ? (daysOverTarget / cogsData.length) * 100
        : 0;

      return {
        outlet: outlet.name,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        rollingAverage,
        trendDirection,
        daysOverTarget,
        percentageOverTarget,
        dailyData: cogsData
      };
    } catch (error) {
      console.error('Error calculating trend analysis:', error);
      throw error;
    }
  }

  /**
   * Get current alerts for all outlets
   * @returns {Promise<Array>} Current alerts
   */
  async getCurrentAlerts() {
    try {
      // Get alerts for the last 7 days
      const date = new Date();
      date.setDate(date.getDate() - 7);
      const formattedDate = date.toISOString().split('T')[0];

      const alerts = await Alert.findAll({
        where: {
          date: {
            [Op.gte]: formattedDate
          }
        },
        include: [
          {
            model: Outlet,
            attributes: ['name']
          }
        ],
        order: [['date', 'DESC']]
      });

      return alerts;
    } catch (error) {
      console.error('Error getting current alerts:', error);
      throw error;
    }
  }

  /**
   * Calculate adjusted target based on revenue
   * @private
   * @param {number} revenue - Revenue amount
   * @param {number} standardTarget - Standard target percentage
   * @param {number} lowerThreshold - Lower revenue threshold
   * @param {number} lowerAdjustment - Lower adjustment factor
   * @param {number} upperThreshold - Upper revenue threshold
   * @param {number} upperAdjustment - Upper adjustment factor
   * @returns {number} Adjusted target percentage
   */
  _calculateAdjustedTarget(
    revenue,
    standardTarget,
    lowerThreshold,
    lowerAdjustment,
    upperThreshold,
    upperAdjustment
  ) {
    if (revenue < lowerThreshold) {
      return standardTarget * lowerAdjustment;
    } else if (revenue > upperThreshold) {
      return standardTarget * upperAdjustment;
    } else {
      return standardTarget;
    }
  }

  /**
   * Create or update alert for outlet
   * @private
   * @param {number} outletId - Outlet ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {number} actualPercentage - Actual COGs percentage
   * @param {number} targetPercentage - Target COGs percentage
   * @param {number} variance - Variance from target
   * @param {string} status - Status (WITHIN TARGET or OVER TARGET)
   * @returns {Promise<Object>} Created or updated alert
   */
  async _createOrUpdateAlert(outletId, date, actualPercentage, targetPercentage, variance, status) {
    try {
      // Find existing alert
      const [alert, created] = await Alert.findOrCreate({
        where: {
          outletId,
          date
        },
        defaults: {
          actualPercentage,
          targetPercentage,
          variance,
          status
        }
      });

      // Update if already exists
      if (!created) {
        await alert.update({
          actualPercentage,
          targetPercentage,
          variance,
          status
        });
      }

      return alert;
    } catch (error) {
      console.error('Error creating/updating alert:', error);
      throw error;
    }
  }
}

module.exports = new CogsCalculationService();
