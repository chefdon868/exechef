const express = require('express');
const router = express.Router();
const CogsCalculationService = require('../services/CogsCalculationService');

// Calculate daily COGs for a specific outlet
router.get('/daily/:outletId/:date', async (req, res) => {
  try {
    const { outletId, date } = req.params;
    const result = await CogsCalculationService.calculateDailyCogsForOutlet(outletId, date);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating daily COGs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calculate daily COGs for all outlets
router.get('/daily/all/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const results = await CogsCalculationService.calculateDailyCogsForAllOutlets(date);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error calculating daily COGs for all outlets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calculate COGs for a date range
router.get('/range/:outletId/:startDate/:endDate', async (req, res) => {
  try {
    const { outletId, startDate, endDate } = req.params;
    const results = await CogsCalculationService.calculateCogsForDateRange(outletId, startDate, endDate);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error calculating COGs for date range:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calculate trend analysis
router.get('/trends/:outletId/:days?', async (req, res) => {
  try {
    const { outletId } = req.params;
    const days = req.params.days ? parseInt(req.params.days) : 7;
    const results = await CogsCalculationService.calculateTrendAnalysis(outletId, days);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error calculating trend analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await CogsCalculationService.getCurrentAlerts();
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error getting current alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
