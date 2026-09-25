const express = require('express');
const router = express.Router();
const CogsController = require('../controllers/CogsController');

// Dashboard routes
router.get('/dashboard', CogsController.getDashboardData);
router.get('/outlet/:outletId', CogsController.getOutletDetail);

// Calculation routes
router.get('/daily/:outletId/:date', CogsController.calculateDailyCogsForOutlet);
router.get('/daily/all/:date', CogsController.calculateDailyCogsForAllOutlets);
router.get('/range/:outletId/:startDate/:endDate', CogsController.calculateCogsForDateRange);

// Alert routes
router.get('/alerts', CogsController.getCurrentAlerts);

module.exports = router;
