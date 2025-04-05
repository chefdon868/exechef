const request = require('supertest');
const app = require('../src/server');
const { Outlet, Revenue, Procurement } = require('../src/models');
const CogsCalculationService = require('../src/services/CogsCalculationService');

describe('COGs Calculation API', () => {
  // Test data
  let testOutlet;
  const testDate = new Date().toISOString().split('T')[0];
  
  // Set up test data before tests
  beforeAll(async () => {
    // Create test outlet
    testOutlet = await Outlet.create({
      name: 'Test Outlet',
      description: 'Test Outlet for API tests'
    });
    
    // Create test revenue
    await Revenue.create({
      outletId: testOutlet.id,
      date: testDate,
      amount: 1000,
      category: 'Food',
      notes: 'Test revenue'
    });
    
    // Create test procurement
    await Procurement.create({
      outletId: testOutlet.id,
      date: testDate,
      itemCategory: 'Food',
      itemDescription: 'Test item',
      quantity: 10,
      unitCost: 25,
      totalCost: 250,
      notes: 'Test procurement'
    });
    
    // Create test settings
    await testOutlet.createSetting({
      targetPercentage: 25,
      lowerThreshold: 500,
      lowerAdjustment: 1.2,
      upperThreshold: 2000,
      upperAdjustment: 0.9
    });
  });
  
  // Clean up test data after tests
  afterAll(async () => {
    await Revenue.destroy({ where: { outletId: testOutlet.id } });
    await Procurement.destroy({ where: { outletId: testOutlet.id } });
    await testOutlet.destroy();
  });
  
  describe('GET /api/dashboard/daily/:outletId/:date', () => {
    it('should calculate daily COGs for an outlet', async () => {
      const response = await request(app)
        .get(`/api/dashboard/daily/${testOutlet.id}/${testDate}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('outlet', testOutlet.name);
      expect(response.body).toHaveProperty('date', testDate);
      expect(response.body).toHaveProperty('revenue', 1000);
      expect(response.body).toHaveProperty('cost', 250);
      expect(response.body).toHaveProperty('cogsPercentage', 25);
      expect(response.body).toHaveProperty('standardTarget', 25);
      expect(response.body).toHaveProperty('adjustedTarget');
      expect(response.body).toHaveProperty('variance');
      expect(response.body).toHaveProperty('status');
    });
    
    it('should handle non-existent outlet', async () => {
      const response = await request(app)
        .get(`/api/dashboard/daily/999/${testDate}`);
      
      expect(response.status).toBe(500);
    });
  });
  
  describe('GET /api/dashboard/daily/all/:date', () => {
    it('should calculate daily COGs for all outlets', async () => {
      const response = await request(app)
        .get(`/api/dashboard/daily/all/${testDate}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const outletData = response.body.find(item => item.outlet === testOutlet.name);
      expect(outletData).toBeDefined();
      expect(outletData).toHaveProperty('revenue', 1000);
      expect(outletData).toHaveProperty('cost', 250);
    });
  });
  
  describe('GET /api/dashboard/range/:outletId/:startDate/:endDate', () => {
    it('should calculate COGs for a date range', async () => {
      // Calculate start date (7 days ago)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const formattedStartDate = startDate.toISOString().split('T')[0];
      
      const response = await request(app)
        .get(`/api/dashboard/range/${testOutlet.id}/${formattedStartDate}/${testDate}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
  
  describe('GET /api/dashboard/trends/:outletId/:days', () => {
    it('should calculate trend analysis', async () => {
      const response = await request(app)
        .get(`/api/dashboard/trends/${testOutlet.id}/7`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('outlet', testOutlet.name);
      expect(response.body).toHaveProperty('rollingAverage');
      expect(response.body).toHaveProperty('trendDirection');
      expect(response.body).toHaveProperty('dailyData');
      expect(Array.isArray(response.body.dailyData)).toBe(true);
    });
  });
  
  describe('GET /api/dashboard/alerts', () => {
    it('should get current alerts', async () => {
      const response = await request(app)
        .get('/api/dashboard/alerts');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
  
  describe('GET /api/dashboard', () => {
    it('should get dashboard data', async () => {
      const response = await request(app)
        .get(`/api/dashboard?date=${testDate}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date', testDate);
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('totalRevenue');
      expect(response.body.summary).toHaveProperty('totalCost');
      expect(response.body.summary).toHaveProperty('overallCogsPercentage');
      expect(response.body).toHaveProperty('outlets');
      expect(Array.isArray(response.body.outlets)).toBe(true);
      expect(response.body).toHaveProperty('alerts');
      expect(Array.isArray(response.body.alerts)).toBe(true);
    });
  });
  
  describe('GET /api/dashboard/outlet/:outletId', () => {
    it('should get outlet detail data', async () => {
      const response = await request(app)
        .get(`/api/dashboard/outlet/${testOutlet.id}?days=30`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('outlet', testOutlet.name);
      expect(response.body).toHaveProperty('rollingAverage');
      expect(response.body).toHaveProperty('trendDirection');
      expect(response.body).toHaveProperty('dailyData');
      expect(Array.isArray(response.body.dailyData)).toBe(true);
    });
  });
});
