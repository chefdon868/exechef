# Google Sheets Data Integration Design

## Overview
This document outlines the data integration approach for the automated COGs analysis system using Google Sheets. The solution will connect revenue data from the Flash Report with procurement data from transfer reports to calculate daily COGs by outlet.

## Sheet Structure
The Google Sheets solution will consist of the following interconnected sheets:

### 1. Master Dashboard
- Summary view of all outlets
- Daily COGs vs. target percentages
- Visual indicators for outlets exceeding targets
- Date selector for historical view

### 2. Revenue Import
- Structured template matching the Flash Report format
- Data validation rules to ensure proper formatting
- IMPORTRANGE connections to revenue data source (if available as Google Sheet)
- Manual entry option with validation

### 3. Procurement Import
- Structured template for procurement transfer reports
- Data validation for proper categorization by outlet
- IMPORTRANGE connections to procurement data (if available as Google Sheet)
- Manual entry option with validation

### 4. Outlet Sheets (one per outlet)
- Individual sheets for each outlet (COPRA, BARAVI, BLACK CORAL, etc.)
- Daily revenue data pulled from Revenue Import sheet
- Daily procurement data pulled from Procurement Import sheet
- COGs calculations based on target percentages
- Variance analysis (actual vs. target)

### 5. Settings Sheet
- Target COGs percentages by outlet
- Scaling factors for dynamic adjustments
- Alert thresholds
- User preferences

## Data Integration Approach

### Revenue Data Integration
1. **Data Source**: Flash Report Excel file
2. **Integration Method**:
   - Option 1: User uploads Flash Report to Google Drive and connects via IMPORTRANGE
   - Option 2: User copies data from Flash Report to Revenue Import template
3. **Data Transformation**:
   - QUERY functions to extract relevant data by outlet
   - Data cleaning to standardize outlet names
   - Date formatting for proper time-series analysis

### Procurement Data Integration
1. **Data Source**: Procurement transfer reports (Excel)
2. **Integration Method**:
   - Option 1: User uploads transfer reports to Google Drive and connects via IMPORTRANGE
   - Option 2: User copies data from transfer reports to Procurement Import template
3. **Data Transformation**:
   - QUERY functions to categorize procurement items by outlet
   - Aggregation of daily procurement totals
   - Date alignment with revenue data

## Data Relationships
- Revenue data will be linked to outlets via outlet names or codes
- Procurement data will be categorized by outlet
- Daily COGs will be calculated by dividing procurement costs by revenue for each outlet
- Target percentages will be applied from the Settings sheet

## Formulas and Functions

### Key Google Sheets Functions
- **IMPORTRANGE**: To import data from other Google Sheets
- **QUERY**: To filter and transform imported data
- **VLOOKUP/HLOOKUP**: To match data between sheets
- **SUMIFS**: To aggregate data with multiple conditions
- **ARRAYFORMULA**: To apply calculations across ranges
- **IF/IFS**: For conditional logic in calculations
- **SPARKLINE**: For inline visualizations of trends

### Example Formulas

#### 1. Pulling Revenue Data for an Outlet
```
=QUERY(IMPORTRANGE("sheet_url", "Revenue!A1:Z100"), 
       "SELECT Col3, Col5 WHERE Col1 = 'OUTLET_NAME' AND Col2 >= date '"&TEXT(A1,"yyyy-mm-dd")&"'")
```

#### 2. Calculating Daily COGs Percentage
```
=ARRAYFORMULA(IF(RevenueRange<>0, ProcurementRange/RevenueRange, 0))
```

#### 3. Variance from Target
```
=ARRAYFORMULA(ActualCOGsPercentage-TargetPercentage)
```

#### 4. Conditional Formatting for Alerts
```
=ActualCOGsPercentage>TargetPercentage*1.1
```

## Google Apps Script Automation
The following scripts will be developed to automate the workflow:

### 1. Data Import Script
```javascript
function importFlashReport() {
  // Code to import data from Flash Report
  // Will be triggered manually or on a schedule
}
```

### 2. Daily Update Script
```javascript
function updateDailyCOGs() {
  // Code to update all calculations
  // Will run daily or on demand
}
```

### 3. Email Notification Script
```javascript
function sendAlerts() {
  // Code to check for outlets exceeding targets
  // Will send email notifications to specified users
}
```

## Implementation Steps
1. Create the base Google Sheets structure with all required sheets
2. Set up data validation rules and formatting
3. Implement IMPORTRANGE and QUERY functions for data integration
4. Create calculation formulas for COGs analysis
5. Develop conditional formatting for visual indicators
6. Write Google Apps Script for automation
7. Test with sample data from provided Excel files
