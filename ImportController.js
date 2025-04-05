const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ImportService = require('../services/ImportService');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /xlsx|xls|csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'));
    }
  }
});

/**
 * Controller for handling data import operations
 */
class ImportController {
  /**
   * Import revenue data from file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async importRevenue(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Read file buffer
      const fileBuffer = fs.readFileSync(req.file.path);
      
      // Get column mapping from request body
      const mapping = {
        fileName: req.file.originalname,
        sheetIndex: parseInt(req.body.sheetIndex || '0'),
        dateColumn: req.body.dateColumn,
        outletColumn: req.body.outletColumn,
        categoryColumn: req.body.categoryColumn,
        amountColumn: req.body.amountColumn,
        notesColumn: req.body.notesColumn
      };
      
      // Process file
      const processedData = await ImportService.processRevenueFile(fileBuffer, mapping);
      
      // Save data to database
      const savedData = await ImportService.saveRevenueData(processedData);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.status(200).json({
        message: 'Revenue data imported successfully',
        count: savedData.length,
        data: savedData.slice(0, 5) // Return first 5 records as preview
      });
    } catch (error) {
      console.error('Error importing revenue data:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * Import procurement data from file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async importProcurement(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Read file buffer
      const fileBuffer = fs.readFileSync(req.file.path);
      
      // Get column mapping from request body
      const mapping = {
        fileName: req.file.originalname,
        sheetIndex: parseInt(req.body.sheetIndex || '0'),
        dateColumn: req.body.dateColumn,
        outletColumn: req.body.outletColumn,
        itemCategoryColumn: req.body.itemCategoryColumn,
        itemDescriptionColumn: req.body.itemDescriptionColumn,
        quantityColumn: req.body.quantityColumn,
        unitCostColumn: req.body.unitCostColumn,
        totalCostColumn: req.body.totalCostColumn,
        notesColumn: req.body.notesColumn
      };
      
      // Process file
      const processedData = await ImportService.processProcurementFile(fileBuffer, mapping);
      
      // Save data to database
      const savedData = await ImportService.saveProcurementData(processedData);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.status(200).json({
        message: 'Procurement data imported successfully',
        count: savedData.length,
        data: savedData.slice(0, 5) // Return first 5 records as preview
      });
    } catch (error) {
      console.error('Error importing procurement data:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * Validate file before import
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async validateFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Read file buffer
      const fileBuffer = fs.readFileSync(req.file.path);
      
      // Get file extension
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      
      // Validate file format
      if (!['.xlsx', '.xls', '.csv'].includes(fileExtension)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Unsupported file format. Please upload CSV or Excel files.' });
      }
      
      // For Excel files, get sheet names and preview
      if (['.xlsx', '.xls'].includes(fileExtension)) {
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        
        const sheets = workbook.worksheets.map((sheet, index) => ({
          index,
          name: sheet.name,
          rowCount: sheet.rowCount,
          columnCount: sheet.columnCount
        }));
        
        // Get headers from first sheet
        const firstSheet = workbook.worksheets[0];
        const headers = [];
        firstSheet.getRow(1).eachCell((cell, colNumber) => {
          headers.push({
            index: colNumber - 1,
            name: cell.value
          });
        });
        
        // Get preview of first 5 rows
        const preview = [];
        for (let i = 2; i <= Math.min(6, firstSheet.rowCount); i++) {
          const row = firstSheet.getRow(i);
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            rowData[headers[colNumber - 1].name] = cell.value;
          });
          preview.push(rowData);
        }
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        return res.status(200).json({
          fileType: 'excel',
          sheets,
          headers,
          preview
        });
      }
      
      // For CSV files, get headers and preview
      if (fileExtension === '.csv') {
        const csv = require('csv-parser');
        const results = [];
        
        // Create a temporary file to read from
        const tempFilePath = req.file.path;
        
        await new Promise((resolve, reject) => {
          fs.createReadStream(tempFilePath)
            .pipe(csv())
            .on('data', (data) => {
              results.push(data);
              if (results.length >= 5) {
                // Stop after 5 rows for preview
                resolve();
              }
            })
            .on('end', () => {
              resolve();
            })
            .on('error', (error) => {
              reject(error);
            });
        });
        
        // Get headers from first row
        const headers = results.length > 0 ? Object.keys(results[0]).map((name, index) => ({
          index,
          name
        })) : [];
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        return res.status(200).json({
          fileType: 'csv',
          sheets: [{ index: 0, name: 'CSV Data', rowCount: results.length, columnCount: headers.length }],
          headers,
          preview: results
        });
      }
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.status(400).json({ error: 'Unable to validate file' });
    } catch (error) {
      console.error('Error validating file:', error);
      
      // Clean up uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * Get import history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getImportHistory(req, res) {
    try {
      // Get recent revenue imports
      const revenueImports = await ImportService.getRecentImports('revenue');
      
      // Get recent procurement imports
      const procurementImports = await ImportService.getRecentImports('procurement');
      
      res.status(200).json({
        revenue: revenueImports,
        procurement: procurementImports
      });
    } catch (error) {
      console.error('Error getting import history:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ImportController();
