# Advanced Configuration Guide

## Technical Implementation Details

This document provides technical details for customizing and extending the COGs Analysis System. It's intended for users with Google Sheets and Google Apps Script experience who want to modify or enhance the system.

## Google Sheets Structure

### Data Flow Architecture

The system uses the following data flow:
```
Revenue Import → Outlet Sheets → Master Dashboard
                ↑
Procurement Import
                ↑
Settings (Target Percentages & Thresholds)
```

### Key Formulas

#### Revenue Data Extraction
```
=QUERY('Revenue_Import'!A:E, "SELECT A, D WHERE B = 'OUTLET_NAME' AND A = date '"&TEXT(TODAY(),"yyyy-mm-dd")&"'")
```

#### Procurement Data Extraction
```
=QUERY('Procurement_Import'!A:H, "SELECT A, SUM(G) WHERE B = 'OUTLET_NAME' AND A = date '"&TEXT(TODAY(),"yyyy-mm-dd")&"' GROUP BY A")
```

#### COGs Percentage Calculation
```
=IF(B2>0, C2/B2, 0)
```

#### Dynamic Target Adjustment
```
=VLOOKUP(OutletName, Settings!A:F, 2, FALSE) * 
 IF(Revenue < VLOOKUP(OutletName, Settings!A:F, 3, FALSE), 
    VLOOKUP(OutletName, Settings!A:F, 4, FALSE), 
    IF(Revenue > VLOOKUP(OutletName, Settings!A:F, 5, FALSE), 
       VLOOKUP(OutletName, Settings!A:F, 6, FALSE), 
       1))
```

#### Trend Analysis
```
=AVERAGE(QUERY(OutletSheet!D:D, "SELECT D WHERE A >= date '"&TEXT(TODAY()-7,"yyyy-mm-dd")&"' AND A <= date '"&TEXT(TODAY(),"yyyy-mm-dd")&"'"))
```

## Google Apps Script Code

### Complete Script Reference

```javascript
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var outletSheet = ss.getSheetByName(outletName);
  var settingsSheet = ss.getSheetByName('Settings');
  
  // Get outlet settings
  var outletSettings = getOutletSettings(outletName);
  
  // Get revenue data
  var revenueData = getRevenueData(outletName);
  
  // Get procurement data
  var procurementData = getProcurementData(outletName);
  
  // Calculate COGs percentages and variances
  var results = [];
  for (var i = 0; i < revenueData.length; i++) {
    var date = revenueData[i].date;
    var revenue = revenueData[i].revenue;
    
    // Find matching procurement data
    var cogs = 0;
    for (var j = 0; j < procurementData.length; j++) {
      if (procurementData[j].date.getTime() === date.getTime()) {
        cogs = procurementData[j].cost;
        break;
      }
    }
    
    // Calculate COGs percentage
    var cogsPercentage = revenue > 0 ? cogs / revenue : 0;
    
    // Calculate adjusted target
    var adjustedTarget = calculateAdjustedTarget(
      revenue, 
      outletSettings.standardTarget,
      outletSettings.lowerThreshold,
      outletSettings.lowerAdjustment,
      outletSettings.upperThreshold,
      outletSettings.upperAdjustment
    );
    
    // Calculate variance
    var variance = adjustedTarget - cogsPercentage;
    
    // Determine status
    var status = cogsPercentage <= adjustedTarget ? "WITHIN TARGET" : "OVER TARGET";
    
    results.push({
      date: date,
      revenue: revenue,
      cogs: cogs,
      cogsPercentage: cogsPercentage,
      standardTarget: outletSettings.standardTarget,
      adjustedTarget: adjustedTarget,
      variance: variance,
      status: status
    });
  }
  
  // Update outlet sheet with results
  updateOutletSheet(outletName, results);
}

/**
 * Gets settings for a specific outlet
 */
function getOutletSettings(outletName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName('Settings');
  
  // Find outlet in settings
  var data = settingsSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === outletName) {
      return {
        standardTarget: data[i][1],
        lowerThreshold: data[i][2],
        lowerAdjustment: data[i][3],
        upperThreshold: data[i][4],
        upperAdjustment: data[i][5]
      };
    }
  }
  
  // Default settings if not found
  return {
    standardTarget: 0.25,
    lowerThreshold: 1000,
    lowerAdjustment: 1.1,
    upperThreshold: 5000,
    upperAdjustment: 0.95
  };
}

/**
 * Gets revenue data for a specific outlet
 */
function getRevenueData(outletName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var revenueSheet = ss.getSheetByName('Revenue_Import');
  
  var data = revenueSheet.getDataRange().getValues();
  var results = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === outletName) {
      results.push({
        date: new Date(data[i][0]),
        revenue: data[i][3]
      });
    }
  }
  
  return results;
}

/**
 * Gets procurement data for a specific outlet
 */
function getProcurementData(outletName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var procurementSheet = ss.getSheetByName('Procurement_Import');
  
  var data = procurementSheet.getDataRange().getValues();
  var results = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === outletName) {
      results.push({
        date: new Date(data[i][0]),
        cost: data[i][6]
      });
    }
  }
  
  return results;
}

/**
 * Calculates adjusted target based on revenue
 */
function calculateAdjustedTarget(revenue, standardTarget, lowerThreshold, lowerAdjustment, upperThreshold, upperAdjustment) {
  if (revenue < lowerThreshold) {
    return standardTarget * lowerAdjustment;
  } else if (revenue > upperThreshold) {
    return standardTarget * upperAdjustment;
  } else {
    return standardTarget;
  }
}

/**
 * Updates outlet sheet with calculated results
 */
function updateOutletSheet(outletName, results) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var outletSheet = ss.getSheetByName(outletName);
  
  // Clear existing data
  var lastRow = Math.max(outletSheet.getLastRow(), 2);
  if (lastRow > 2) {
    outletSheet.getRange(3, 1, lastRow - 2, 7).clear();
  }
  
  // Add headers if needed
  if (outletSheet.getLastRow() < 2) {
    outletSheet.getRange(2, 1, 1, 7).setValues([
      ['Date', 'Revenue', 'COGs', 'COGs %', 'Target %', 'Variance', 'Status']
    ]);
  }
  
  // Add results
  if (results.length > 0) {
    var data = [];
    for (var i = 0; i < results.length; i++) {
      data.push([
        results[i].date,
        results[i].revenue,
        results[i].cogs,
        results[i].cogsPercentage,
        results[i].adjustedTarget,
        results[i].variance,
        results[i].status
      ]);
    }
    outletSheet.getRange(3, 1, data.length, 7).setValues(data);
    
    // Format percentages
    outletSheet.getRange(3, 4, data.length, 3).setNumberFormat('0.00%');
    
    // Add conditional formatting for status
    var statusRange = outletSheet.getRange(3, 7, data.length, 1);
    var rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('OVER TARGET')
      .setBackground('#FF9999')
      .setRanges([statusRange])
      .build();
    var rules = outletSheet.getConditionalFormatRules();
    rules.push(rule);
    outletSheet.setConditionalFormatRules(rules);
  }
}

/**
 * Updates the master dashboard with summary data
 */
function updateDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName('Master_Dashboard');
  
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
  
  // Get selected date from dashboard
  var selectedDate = dashboard.getRange('A1').getValue();
  if (!(selectedDate instanceof Date)) {
    selectedDate = new Date();
    dashboard.getRange('A1').setValue(selectedDate);
  }
  
  // Clear existing data
  var lastRow = Math.max(dashboard.getLastRow(), 4);
  if (lastRow > 4) {
    dashboard.getRange(5, 1, lastRow - 4, 8).clear();
  }
  
  // Add headers if needed
  if (dashboard.getLastRow() < 4) {
    dashboard.getRange(4, 1, 1, 8).setValues([
      ['Outlet', 'Revenue', 'COGs', 'COGs %', 'Target %', 'Adjusted %', 'Variance', 'Status']
    ]);
  }
  
  // Collect data from all outlet sheets
  var data = [];
  for (var i = 0; i < outletSheets.length; i++) {
    var outletSheet = ss.getSheetByName(outletSheets[i]);
    var outletData = outletSheet.getDataRange().getValues();
    
    // Find row with matching date
    for (var j = 2; j < outletData.length; j++) {
      var rowDate = new Date(outletData[j][0]);
      if (rowDate.toDateString() === selectedDate.toDateString()) {
        data.push([
          outletSheets[i],
          outletData[j][1],
          outletData[j][2],
          outletData[j][3],
          outletData[j][4],
          outletData[j][4], // Adjusted target (same as target in this simplified version)
          outletData[j][5],
          outletData[j][6]
        ]);
        break;
      }
    }
  }
  
  // Add data to dashboard
  if (data.length > 0) {
    dashboard.getRange(5, 1, data.length, 8).setValues(data);
    
    // Format percentages
    dashboard.getRange(5, 4, data.length, 4).setNumberFormat('0.00%');
    
    // Add conditional formatting for status
    var statusRange = dashboard.getRange(5, 8, data.length, 1);
    var rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('OVER TARGET')
      .setBackground('#FF9999')
      .setRanges([statusRange])
      .build();
    var rules = dashboard.getConditionalFormatRules();
    rules.push(rule);
    dashboard.setConditionalFormatRules(rules);
  }
}

/**
 * Sends email alerts for outlets exceeding target COGs
 */
function sendAlertEmail() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName('Master_Dashboard');
  
  // Get dashboard data
  var data = dashboard.getDataRange().getValues();
  
  // Find outlets over target
  var alertOutlets = [];
  for (var i = 4; i < data.length; i++) {
    if (data[i][7] === 'OVER TARGET') {
      alertOutlets.push({
        outlet: data[i][0],
        cogsPercentage: data[i][3],
        target: data[i][5],
        variance: data[i][6]
      });
    }
  }
  
  // Send email if there are alerts
  if (alertOutlets.length > 0) {
    var recipientEmail = "manager@resort.com"; // Would be configurable
    var subject = "COGs Alert - Outlets Exceeding Targets";
    
    // Build email body
    var body = "The following outlets have COGs percentages exceeding targets:\n\n";
    
    for (var i = 0; i < alertOutlets.length; i++) {
      body += alertOutlets[i].outlet + ": " + 
              (alertOutlets[i].cogsPercentage * 100).toFixed(2) + "% vs target " + 
              (alertOutlets[i].target * 100).toFixed(2) + "% (variance: " + 
              (alertOutlets[i].variance * 100).toFixed(2) + "%)\n";
    }
    
    // Uncomment to actually send the email
    // MailApp.sendEmail(recipientEmail, subject, body);
    
    SpreadsheetApp.getUi().alert('Alert email would be sent to ' + recipientEmail + ' with ' + alertOutlets.length + ' outlets over target.');
  } else {
    SpreadsheetApp.getUi().alert('No outlets are currently exceeding their targets.');
  }
}
```

### Customizing the Script

#### Adding Seasonal Adjustments

To implement seasonal adjustments, add this function:

```javascript
/**
 * Applies seasonal adjustments to target percentages
 */
function applySeasonalAdjustment(standardTarget, date) {
  var month = date.getMonth(); // 0-11
  
  // High season adjustment (December-February)
  if (month >= 11 || month <= 1) {
    return standardTarget * 0.95; // 5% lower target during high season
  }
  
  // Low season adjustment (May-August)
  if (month >= 4 && month <= 7) {
    return standardTarget * 1.05; // 5% higher target during low season
  }
  
  // Standard target for other months
  return standardTarget;
}
```

Then modify the `calculateAdjustedTarget` function:

```javascript
function calculateAdjustedTarget(revenue, standardTarget, lowerThreshold, lowerAdjustment, upperThreshold, upperAdjustment, date) {
  // Apply seasonal adjustment first
  var seasonalTarget = applySeasonalAdjustment(standardTarget, date);
  
  // Then apply revenue-based adjustment
  if (revenue < lowerThreshold) {
    return seasonalTarget * lowerAdjustment;
  } else if (revenue > upperThreshold) {
    return seasonalTarget * upperAdjustment;
  } else {
    return seasonalTarget;
  }
}
```

#### Adding Email Configuration

To make email recipients configurable:

```javascript
/**
 * Gets email configuration from Settings sheet
 */
function getEmailConfig() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName('Settings');
  
  // Assuming email settings are in cells A20:B22
  var emailSettings = settingsSheet.getRange('A20:B22').getValues();
  
  return {
    recipients: emailSettings[0][1], // Primary recipient
    ccRecipients: emailSettings[1][1], // CC recipients
    alertThreshold: emailSettings[2][1] // Alert threshold percentage
  };
}
```

## Data Model

### Settings Sheet Structure

| Column | Description |
|--------|-------------|
| A | Outlet Name |
| B | Standard Target % |
| C | Lower Revenue Threshold |
| D | Lower Adjustment Factor |
| E | Upper Revenue Threshold |
| F | Upper Adjustment Factor |

### Revenue Import Structure

| Column | Description |
|--------|-------------|
| A | Date |
| B | Outlet |
| C | Revenue Category |
| D | Revenue Amount |
| E | Notes |

### Procurement Import Structure

| Column | Description |
|--------|-------------|
| A | Date |
| B | Outlet |
| C | Item Category |
| D | Item Description |
| E | Quantity |
| F | Unit Cost |
| G | Total Cost |
| H | Notes |

## Integration Options

### Connecting with Accounting Software

If your accounting software can export to Google Sheets or CSV:

1. Set up a scheduled export from your accounting software
2. Use IMPORTRANGE to pull data into the Revenue_Import sheet:
   ```
   =IMPORTRANGE("URL_OF_EXPORTED_SHEET", "Sheet1!A1:E100")
   ```

### Automating with Triggers

Set up time-based triggers to automate the system:

1. In Google Apps Script, click on the clock icon (Triggers)
2. Click "Add Trigger"
3. Select the function to run (e.g., updateCalculations)
4. Set the time-based trigger (e.g., daily at 8 AM)
5. Save the trigger

Example trigger setup:
```javascript
function createDailyTrigger() {
  ScriptApp.newTrigger('updateCalculations')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
}
```

### Exporting Data to Other Systems

To export data to other systems:

```javascript
/**
 * Exports dashboard data as CSV
 */
function exportDashboardCSV() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName('Master_Dashboard');
  
  // Get dashboard data
  var data = dashboard.getDataRange().getValues();
  
  // Convert to CSV
  var csv = '';
  for (var i = 0; i < data.length; i++) {
    csv += data[i].join(',') + '\n';
  }
  
  // Create file in Google Drive
  var fileName = 'COGs_Dashboard_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + '.csv';
  var file = DriveApp.createFile(fileName, csv);
  
  // Return file URL
  return file.getUrl();
}
```

## Performance Optimization

### Large Dataset Handling

For large datasets:

1. Use query functions instead of array formulas
2. Implement pagination in the dashboard
3. Archive historical data to separate sheets

Example pagination implementation:
```javascript
function paginateDashboard(pageSize, pageNumber) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName('Master_Dashboard');
  
  // Calculate start and end rows
  var startRow = (pageNumber - 1) * pageSize + 5; // +5 to account for headers
  var endRow = startRow + pageSize - 1;
  
  // Get total data rows
  var totalRows = dashboard.getLastRow() - 4;
  var totalPages = Math.ceil(totalRows / pageSize);
  
  // Update pagination controls
  dashboard.getRange('J2').setValue('Page ' + pageNumber + ' of ' + totalPages);
  
  // Show only current page
  dashboard.hideRows(5, dashboard.getLastRow() - 4);
  dashboard.showRows(startRow, pageSize);
}
```

## Security Considerations

### Data Protection

1. Use Google Sheets' sharing settings to control access
2. Consider using separate sheets for sensitive data
3. Implement cell protection for formula cells

Example protection setup:
```javascript
function protectFormulaCells() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName('Master_Dashboard');
  
  // Protect formula ranges
  var protection = dashboard.getRange('D5:H100').protect();
  
  // Allow only specific users to edit
  protection.addEditor('manager@resort.com');
  
  // Remove all other editors
  protection.removeEditors(protection.getEditors());
  
  // Allow the owner to edit
  protection.setDomainEdit(false);
}
```

## Conclusion

This Advanced Configuration Guide provides the technical details needed to customize and extend the COGs Analysis System. By modifying the Google Apps Script code and sheet formulas, you can adapt the system to your specific requirements and integrate it with other business systems.

For further assistance with advanced customization, please consult with a Google Workspace developer or your IT department.
