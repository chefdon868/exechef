const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const { Outlet, Revenue, Procurement } = require('../models');

/**
 * Service for handling data import functionality
 */
class ImportService {
  /**
   * Process revenue data from Excel file
   * @param {Buffer} fileBuffer - The uploaded file buffer
   * @param {Object} mapping - Column mapping configuration
   * @returns {Promise<Array>} Processed revenue data
   */
  async processRevenueFile(fileBuffer, mapping) {
    try {
      const fileExtension = this._getFileExtension(mapping.fileName);
      let data = [];
      
      if (fileExtension === '.csv') {
        data = await this._processCSV(fileBuffer, mapping);
      } else if (['.xlsx', '.xls'].includes(fileExtension)) {
        data = await this._processExcel(fileBuffer, mapping);
      } else {
        throw new Error('Unsupported file format. Please upload CSV or Excel files.');
      }
      
      // Transform data to match Revenue model
      const transformedData = await this._transformRevenueData(data, mapping);
      return transformedData;
    } catch (error) {
      console.error('Error processing revenue file:', error);
      throw error;
    }
  }
  
  /**
   * Process procurement data from Excel file
   * @param {Buffer} fileBuffer - The uploaded file buffer
   * @param {Object} mapping - Column mapping configuration
   * @returns {Promise<Array>} Processed procurement data
   */
  async processProcurementFile(fileBuffer, mapping) {
    try {
      const fileExtension = this._getFileExtension(mapping.fileName);
      let data = [];
      
      if (fileExtension === '.csv') {
        data = await this._processCSV(fileBuffer, mapping);
      } else if (['.xlsx', '.xls'].includes(fileExtension)) {
        data = await this._processExcel(fileBuffer, mapping);
      } else {
        throw new Error('Unsupported file format. Please upload CSV or Excel files.');
      }
      
      // Transform data to match Procurement model
      const transformedData = await this._transformProcurementData(data, mapping);
      return transformedData;
    } catch (error) {
      console.error('Error processing procurement file:', error);
      throw error;
    }
  }
  
  /**
   * Save revenue data to database
   * @param {Array} data - Processed revenue data
   * @returns {Promise<Array>} Saved revenue records
   */
  async saveRevenueData(data) {
    try {
      const results = [];
      
      for (const item of data) {
        // Find or create outlet
        const [outlet] = await Outlet.findOrCreate({
          where: { name: item.outletName },
          defaults: { description: `Outlet for ${item.outletName}` }
        });
        
        // Create or update revenue record
        const [revenue, created] = await Revenue.findOrCreate({
          where: {
            outletId: outlet.id,
            date: item.date,
            category: item.category || 'Default'
          },
          defaults: {
            amount: item.amount,
            notes: item.notes
          }
        });
        
        // If record exists, update it
        if (!created) {
          await revenue.update({
            amount: item.amount,
            notes: item.notes
          });
        }
        
        results.push(revenue);
      }
      
      return results;
    } catch (error) {
      console.error('Error saving revenue data:', error);
      throw error;
    }
  }
  
  /**
   * Save procurement data to database
   * @param {Array} data - Processed procurement data
   * @returns {Promise<Array>} Saved procurement records
   */
  async saveProcurementData(data) {
    try {
      const results = [];
      
      for (const item of data) {
        // Find or create outlet
        const [outlet] = await Outlet.findOrCreate({
          where: { name: item.outletName },
          defaults: { description: `Outlet for ${item.outletName}` }
        });
        
        // Create procurement record
        const procurement = await Procurement.create({
          outletId: outlet.id,
          date: item.date,
          itemCategory: item.itemCategory,
          itemDescription: item.itemDescription,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.totalCost,
          notes: item.notes
        });
        
        results.push(procurement);
      }
      
      return results;
    } catch (error) {
      console.error('Error saving procurement data:', error);
      throw error;
    }
  }
  
  /**
   * Process CSV file
   * @private
   * @param {Buffer} fileBuffer - The uploaded file buffer
   * @param {Object} mapping - Column mapping configuration
   * @returns {Promise<Array>} Parsed CSV data
   */
  async _processCSV(fileBuffer, mapping) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      // Create a temporary file to read from
      const tempFilePath = path.join(__dirname, '../../temp', `temp_${Date.now()}.csv`);
      fs.writeFileSync(tempFilePath, fileBuffer);
      
      fs.createReadStream(tempFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // Clean up temp file
          fs.unlinkSync(tempFilePath);
          resolve(results);
        })
        .on('error', (error) => {
          // Clean up temp file
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
          reject(error);
        });
    });
  }
  
  /**
   * Process Excel file
   * @private
   * @param {Buffer} fileBuffer - The uploaded file buffer
   * @param {Object} mapping - Column mapping configuration
   * @returns {Promise<Array>} Parsed Excel data
   */
  async _processExcel(fileBuffer, mapping) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);
      
      const worksheet = workbook.worksheets[mapping.sheetIndex || 0];
      const results = [];
      
      // Get headers from the first row
      const headers = [];
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value;
      });
      
      // Process each row
      worksheet.eachRow((row, rowNumber) => {
        // Skip header row
        if (rowNumber === 1) return;
        
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          rowData[headers[colNumber - 1]] = cell.value;
        });
        
        results.push(rowData);
      });
      
      return results;
    } catch (error) {
      console.error('Error processing Excel file:', error);
      throw error;
    }
  }
  
  /**
   * Transform raw data to match Revenue model
   * @private
   * @param {Array} data - Raw data from file
   * @param {Object} mapping - Column mapping configuration
   * @returns {Promise<Array>} Transformed data
   */
  async _transformRevenueData(data, mapping) {
    return data.map(row => {
      return {
        outletName: row[mapping.outletColumn],
        date: this._parseDate(row[mapping.dateColumn]),
        category: row[mapping.categoryColumn] || 'Default',
        amount: parseFloat(row[mapping.amountColumn]),
        notes: row[mapping.notesColumn] || ''
      };
    }).filter(item => {
      // Filter out invalid data
      return item.outletName && item.date && !isNaN(item.amount);
    });
  }
  
  /**
   * Transform raw data to match Procurement model
   * @private
   * @param {Array} data - Raw data from file
   * @param {Object} mapping - Column mapping configuration
   * @returns {Promise<Array>} Transformed data
   */
  async _transformProcurementData(data, mapping) {
    return data.map(row => {
      const quantity = parseFloat(row[mapping.quantityColumn]) || 1;
      const unitCost = parseFloat(row[mapping.unitCostColumn]);
      const totalCost = parseFloat(row[mapping.totalCostColumn]) || (quantity * unitCost);
      
      return {
        outletName: row[mapping.outletColumn],
        date: this._parseDate(row[mapping.dateColumn]),
        itemCategory: row[mapping.itemCategoryColumn] || 'Default',
        itemDescription: row[mapping.itemDescriptionColumn] || '',
        quantity: quantity,
        unitCost: unitCost,
        totalCost: totalCost,
        notes: row[mapping.notesColumn] || ''
      };
    }).filter(item => {
      // Filter out invalid data
      return item.outletName && item.date && !isNaN(item.totalCost);
    });
  }
  
  /**
   * Parse date from various formats
   * @private
   * @param {string|Date} dateValue - Date value from file
   * @returns {Date} Parsed date
   */
  _parseDate(dateValue) {
    if (!dateValue) return null;
    
    // If already a Date object
    if (dateValue instanceof Date) return dateValue;
    
    // If Excel serial number
    if (typeof dateValue === 'number') {
      // Excel date serial number (days since 1900-01-01, with a leap year bug)
      const excelEpoch = new Date(1899, 11, 30);
      return new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
    }
    
    // Try parsing string date
    return new Date(dateValue);
  }
  
  /**
   * Get file extension from filename
   * @private
   * @param {string} filename - File name
   * @returns {string} File extension
   */
  _getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }
}

module.exports = new ImportService();
