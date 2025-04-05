const request = require('supertest');
const app = require('../src/server');
const { Outlet, Revenue, Procurement } = require('../src/models');
const ImportService = require('../src/services/ImportService');
const fs = require('fs');
const path = require('path');

describe('Data Import API', () => {
  // Test data
  let testOutlet;
  const testFile = path.join(__dirname, 'fixtures', 'test_revenue.xlsx');
  
  // Set up test data before tests
  beforeAll(async () => {
    // Create test outlet if needed for reference
    [testOutlet] = await Outlet.findOrCreate({
      where: { name: 'Test Outlet' },
      defaults: { description: 'Test Outlet for API tests' }
    });
    
    // Create test file fixture if it doesn't exist
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir);
    }
    
    // We'll mock the file validation instead of creating actual files
  });
  
  // Clean up test data after tests
  afterAll(async () => {
    // Clean up any test data created during tests
    await Revenue.destroy({ where: { notes: 'Test import' } });
    await Procurement.destroy({ where: { notes: 'Test import' } });
  });
  
  describe('POST /api/import/validate', () => {
    it('should validate Excel file structure', async () => {
      // Mock ImportService.processExcel
      const originalProcessExcel = ImportService._processExcel;
      ImportService._processExcel = jest.fn().mockResolvedValue([
        { Date: '2025-04-01', Outlet: 'Test Outlet', Amount: 1000 }
      ]);
      
      const response = await request(app)
        .post('/api/import/validate')
        .attach('file', Buffer.from('dummy content'), {
          filename: 'test.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
      
      // Restore original method
      ImportService._processExcel = originalProcessExcel;
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fileType', 'excel');
      expect(response.body).toHaveProperty('headers');
      expect(response.body).toHaveProperty('preview');
    });
    
    it('should reject invalid file types', async () => {
      const response = await request(app)
        .post('/api/import/validate')
        .attach('file', Buffer.from('dummy content'), {
          filename: 'test.txt',
          contentType: 'text/plain'
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('POST /api/import/revenue', () => {
    it('should import revenue data', async () => {
      // Mock ImportService methods
      const originalProcessRevenueFile = ImportService.processRevenueFile;
      const originalSaveRevenueData = ImportService.saveRevenueData;
      
      ImportService.processRevenueFile = jest.fn().mockResolvedValue([
        {
          outletName: 'Test Outlet',
          date: new Date('2025-04-01'),
          category: 'Food',
          amount: 1000,
          notes: 'Test import'
        }
      ]);
      
      ImportService.saveRevenueData = jest.fn().mockResolvedValue([
        {
          id: 1,
          outletId: testOutlet.id,
          date: new Date('2025-04-01'),
          category: 'Food',
          amount: 1000,
          notes: 'Test import'
        }
      ]);
      
      const response = await request(app)
        .post('/api/import/revenue')
        .field('dateColumn', 'Date')
        .field('outletColumn', 'Outlet')
        .field('amountColumn', 'Amount')
        .field('categoryColumn', 'Category')
        .field('notesColumn', 'Notes')
        .attach('file', Buffer.from('dummy content'), {
          filename: 'test.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
      
      // Restore original methods
      ImportService.processRevenueFile = originalProcessRevenueFile;
      ImportService.saveRevenueData = originalSaveRevenueData;
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Revenue data imported successfully');
      expect(response.body).toHaveProperty('count', 1);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  describe('POST /api/import/procurement', () => {
    it('should import procurement data', async () => {
      // Mock ImportService methods
      const originalProcessProcurementFile = ImportService.processProcurementFile;
      const originalSaveProcurementData = ImportService.saveProcurementData;
      
      ImportService.processProcurementFile = jest.fn().mockResolvedValue([
        {
          outletName: 'Test Outlet',
          date: new Date('2025-04-01'),
          itemCategory: 'Food',
          itemDescription: 'Test item',
          quantity: 10,
          unitCost: 25,
          totalCost: 250,
          notes: 'Test import'
        }
      ]);
      
      ImportService.saveProcurementData = jest.fn().mockResolvedValue([
        {
          id: 1,
          outletId: testOutlet.id,
          date: new Date('2025-04-01'),
          itemCategory: 'Food',
          itemDescription: 'Test item',
          quantity: 10,
          unitCost: 25,
          totalCost: 250,
          notes: 'Test import'
        }
      ]);
      
      const response = await request(app)
        .post('/api/import/procurement')
        .field('dateColumn', 'Date')
        .field('outletColumn', 'Outlet')
        .field('itemCategoryColumn', 'Category')
        .field('itemDescriptionColumn', 'Description')
        .field('quantityColumn', 'Quantity')
        .field('unitCostColumn', 'UnitCost')
        .field('totalCostColumn', 'TotalCost')
        .field('notesColumn', 'Notes')
        .attach('file', Buffer.from('dummy content'), {
          filename: 'test.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
      
      // Restore original methods
      ImportService.processProcurementFile = originalProcessProcurementFile;
      ImportService.saveProcurementData = originalSaveProcurementData;
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Procurement data imported successfully');
      expect(response.body).toHaveProperty('count', 1);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
