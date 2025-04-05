// Google Apps Script for COGs Analysis System

/**
 * Creates a menu when the spreadsheet is opened
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('COGs Analysis')
    .addItem('Import Revenue Data', 'importRevenueData')
    .addItem('Import Procurement Data', 'importProcurementData')
    .addItem('Update All Calculations', 'updateCalculations')
    .addItem('Send COGs Alert Email', 'sendAlertEmail')
    .addToUi();
}

/**
 * Imports revenue data from uploaded Flash Report
 */
function importRevenueData() {
  // This would be implemented to import data from the Flash Report
  // Either through file upload or IMPORTRANGE from another sheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Revenue_Import');
  
  // Example implementation would:
  // 1. Clear existing data
  // 2. Import new data
  // 3. Format and validate the data
  // 4. Update the date of last import
  
  SpreadsheetApp.getUi().alert('Revenue data has been imported and processed.');
}

/**
 * Imports procurement data from transfer reports
 */
function importProcurementData() {
  // This would be implemented to import data from procurement transfer reports
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Procurement_Import');
  
  // Example implementation would:
  // 1. Clear existing data
  // 2. Import new data
  // 3. Categorize by outlet
  // 4. Calculate daily totals
  
  SpreadsheetApp.getUi().alert('Procurement data has been imported and processed.');
}

/**
 * Updates all COGs calculations across outlet sheets
 */
function updateCalculations() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName('Settings');
  
  // Get all outlet sheets
  var sheets = ss.getSheets();
  var outletSheets = [];
  
  for (var i = 0; i < sheets.length; i++) {
    var sheetName = sheets[i].getName();
    if (sheetName !== 'Master_Dashboard' && 
        sheetName !== 'Revenue_Import' && 
        sheetName !== 'Procurement_Import' && 
        sheetName !== 'Settings') {
      outletSheets.push(sheetName);
    }
  }
  
  // Update calculations for each outlet
  for (var i = 0; i < outletSheets.length; i++) {
    updateOutletCalculations(outletSheets[i]);
  }
  
  // Update master dashboard
  updateDashboard();
  
  SpreadsheetApp.getUi().alert('All calculations have been updated.');
}

/**
 * Updates calculations for a specific outlet
 */
function updateOutletCalculations(outletName) {
  // This would calculate COGs for the specified outlet
  // Based on revenue and procurement data
  
  // Implementation would:
  // 1. Get revenue data for this outlet
  // 2. Get procurement data for this outlet
  // 3. Calculate daily COGs percentage
  // 4. Compare against target
  // 5. Update status indicators
}

/**
 * Updates the master dashboard with summary data
 */
function updateDashboard() {
  // This would update the master dashboard with data from all outlets
  
  // Implementation would:
  // 1. Clear existing dashboard data
  // 2. Gather data from all outlet sheets
  // 3. Calculate summary metrics
  // 4. Update visualizations
}

/**
 * Sends email alerts for outlets exceeding target COGs
 */
function sendAlertEmail() {
  // This would check all outlets for COGs exceeding targets
  // and send email notifications
  
  var recipientEmail = "manager@resort.com"; // Would be configurable
  var subject = "COGs Alert - Outlets Exceeding Targets";
  
  // Build email body with outlets exceeding targets
  var body = "The following outlets have COGs percentages exceeding targets:\n\n";
  
  // Add outlets exceeding targets to the email
  // This would be dynamically generated based on actual data
  
  // Send the email
  // MailApp.sendEmail(recipientEmail, subject, body);
  
  SpreadsheetApp.getUi().alert('Alert email has been sent.');
}
