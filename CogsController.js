const CogsCalculationService = require('../services/CogsCalculationService');

/**
 * Controller for COGs calculations and dashboard data
 */
class CogsController {
  /**
   * Get dashboard data for all outlets
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDashboardData(req, res) {
    try {
      // Get date from query params or use today
      const date = req.query.date || new Date().toISOString().split('T')[0];
      
      // Calculate COGs for all outlets for the date
      const cogsData = await CogsCalculationService.calculateDailyCogsForAllOutlets(date);
      
      // Get current alerts
      const alerts = await CogsCalculationService.getCurrentAlerts();
      
      // Calculate summary statistics
      const totalRevenue = cogsData.reduce((sum, item) => sum + item.revenue, 0);
      const totalCost = cogsData.reduce((sum, item) => sum + item.cost, 0);
      const outletsWithinTarget = cogsData.filter(item => item.status === 'WITHIN TARGET').length;
      const outletsOverTarget = cogsData.filter(item => item.status === 'OVER TARGET').length;
      
      // Return dashboard data
      res.status(200).json({
        date,
        summary: {
          totalRevenue,
          totalCost,
          overallCogsPercentage: totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0,
          outletsWithinTarget,
          outletsOverTarget
        },
        outlets: cogsData,
        alerts: alerts.slice(0, 5) // Return only the 5 most recent alerts
      });
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * Get outlet detail data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOutletDetail(req, res) {
    try {
      const { outletId } = req.params;
      const days = req.query.days ? parseInt(req.query.days) : 30;
      
      // Get trend analysis for the outlet
      const trendData = await CogsCalculationService.calculateTrendAnalysis(outletId, days);
      
      res.status(200).json(trendData);
    } catch (error) {
      console.error('Error getting outlet detail:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * Calculate daily COGs for a specific outlet
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async calculateDailyCogsForOutlet(req, res) {
    try {
      const { outletId, date } = req.params;
      const result = await CogsCalculationService.calculateDailyCogsForOutlet(outletId, date);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error calculating daily COGs:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * Calculate daily COGs for all outlets
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async calculateDailyCogsForAllOutlets(req, res) {
    try {
      const { date } = req.params;
      const results = await CogsCalculationService.calculateDailyCogsForAllOutlets(date);
      res.status(200).json(results);
    } catch (error) {
      console.error('Error calculating daily COGs for all outlets:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * Calculate COGs for a date range
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async calculateCogsForDateRange(req, res) {
    try {
      const { outletId, startDate, endDate } = req.params;
      const results = await CogsCalculationService.calculateCogsForDateRange(outletId, startDate, endDate);
      res.status(200).json(results);
    } catch (error) {
      console.error('Error calculating COGs for date range:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * Get current alerts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentAlerts(req, res) {
    try {
      const alerts = await CogsCalculationService.getCurrentAlerts();
      res.status(200).json(alerts);
    } catch (error) {
      console.error('Error getting current alerts:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CogsController();
