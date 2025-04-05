# COGs Analysis System User Guide

## Introduction

Welcome to your new automated Cost of Goods (COGs) analysis system. This Google Sheets-based solution streamlines your daily COGs tracking process by automatically connecting revenue data with procurement data and dynamically adjusting COGs targets as revenue changes.

This guide will walk you through how to use the system, from initial setup to daily operation and analysis.

## System Overview

The COGs Analysis System consists of a Google Sheets workbook with the following components:

1. **Master Dashboard**: Summary view of all outlets with key performance indicators
2. **Revenue Import**: Template for importing daily revenue data
3. **Procurement Import**: Template for importing daily procurement/transfer data
4. **Outlet Sheets**: Individual analysis sheets for each outlet (COPRA, BARAVI, etc.)
5. **Settings**: Configuration sheet for target percentages and adjustment thresholds

## Getting Started

### Initial Setup

1. **Create a new Google Sheet** in your Google Drive
2. **Set up the sheet structure**:
   - Create the sheets listed above (Master_Dashboard, Revenue_Import, etc.)
   - Create individual sheets for each outlet (COPRA, BARAVI, BLACK CORAL, etc.)

3. **Configure Settings**:
   - Open the Settings sheet
   - Enter target COGs percentages for each outlet (based on your current 24-25% targets)
   - Configure revenue thresholds for dynamic adjustments
   - Set alert thresholds

4. **Set up Google Apps Script**:
   - From your Google Sheet, click Extensions > Apps Script
   - Copy and paste the provided Apps Script code
   - Save the project
   - Return to your sheet and refresh

## Daily Operation

### Step 1: Import Revenue Data

1. **Option A**: Manual Entry
   - Open the Revenue_Import sheet
   - Enter the date, outlet name, revenue category, and amount for each outlet

   **Option B**: Import from Flash Report
   - If your Flash Report is in Google Sheets, use the IMPORTRANGE function
   - If your Flash Report is in Excel, copy and paste the data into the Revenue_Import sheet

2. **Verify Data**:
   - Ensure all outlets have revenue data entered
   - Check that dates are formatted correctly

### Step 2: Import Procurement Data

1. **Option A**: Manual Entry
   - Open the Procurement_Import sheet
   - Enter the date, outlet name, item details, and costs for each procurement transfer

   **Option B**: Import from Transfer Reports
   - If your transfer reports are in Google Sheets, use the IMPORTRANGE function
   - If your transfer reports are in Excel, copy and paste the data into the Procurement_Import sheet

2. **Verify Data**:
   - Ensure all procurement transfers are categorized by outlet
   - Check that dates match the revenue data dates

### Step 3: Update Calculations

1. Click on the "COGs Analysis" menu at the top of the sheet
2. Select "Update All Calculations"
3. Wait for the confirmation that calculations have been updated

### Step 4: Review Dashboard

1. Open the Master_Dashboard sheet
2. Review the summary table showing all outlets' performance
3. Check for any outlets with "OVER TARGET" status
4. Use the date selector to view different dates if needed

## Key Features

### Dynamic Target Adjustment

The system automatically adjusts COGs targets based on revenue levels:

- **Low Revenue Days**: When revenue falls below the lower threshold (configured in Settings), the target percentage is increased to account for fixed costs representing a larger portion of total costs.
- **Normal Revenue Days**: Within the expected revenue range, standard target percentages apply.
- **High Revenue Days**: When revenue exceeds the upper threshold, the target percentage is decreased to account for economies of scale.

### Trend Analysis

The system analyzes COGs performance trends:

- **7-Day Rolling Average**: Smooths daily fluctuations to show the overall trend
- **Trend Direction**: Identifies if COGs percentages are trending upward, downward, or remaining stable
- **Visualization**: Charts show the trend over time for easy analysis

### Alert System

The system highlights outlets that require attention:

- **Visual Indicators**: Red highlighting for outlets exceeding targets
- **Alert Dashboard**: Dedicated section showing only outlets with issues
- **Email Notifications**: Option to receive email alerts when outlets exceed targets (requires setup)

## Advanced Features

### Customizing the Dashboard

You can customize the dashboard to show the information most relevant to you:

1. **Adding Charts**:
   - Click Insert > Chart
   - Select the data range you want to visualize
   - Choose the chart type and customize as needed

2. **Filtering Data**:
   - Use the outlet filter dropdown to focus on specific outlets
   - Use the date range selector to analyze specific time periods

### Modifying Target Percentages

If your target COGs percentages change:

1. Open the Settings sheet
2. Update the target percentage for the relevant outlet(s)
3. Run "Update All Calculations" from the COGs Analysis menu

### Seasonal Adjustments

If you need to account for seasonal factors:

1. Open the Settings sheet
2. Add seasonal adjustment factors in the designated section
3. Update the Google Apps Script to include seasonal adjustment logic (see Advanced Configuration)

## Troubleshooting

### Common Issues

1. **Missing Data**:
   - Ensure all outlets have revenue data for each day
   - Check that procurement data is correctly categorized by outlet

2. **Formula Errors**:
   - If you see #REF! or #VALUE! errors, check that your data is formatted correctly
   - Ensure dates are in the correct format (YYYY-MM-DD)

3. **Calculation Issues**:
   - If calculations seem incorrect, verify that the formulas haven't been accidentally modified
   - Run "Update All Calculations" from the COGs Analysis menu

### Getting Help

If you encounter issues not covered in this guide:

1. Check the "Advanced Configuration" document for technical details
2. Review the Google Sheets and Google Apps Script documentation
3. Contact your system administrator for assistance

## Maintenance

### Regular Maintenance Tasks

1. **Backup**:
   - Create regular backups by making copies of your Google Sheet
   - Use File > Make a copy to create a backup before making major changes

2. **Data Cleanup**:
   - Periodically archive old data to maintain performance
   - Consider creating monthly or quarterly archive sheets

3. **Formula Verification**:
   - Periodically check that formulas are calculating correctly
   - Verify that dynamic adjustments are working as expected

## Advanced Configuration

For technical details on customizing the system, please refer to the separate "Advanced Configuration Guide" which includes:

- Google Apps Script code documentation
- Formula references
- Data model details
- Integration options with other systems

## Conclusion

This COGs Analysis System automates your daily cost of goods analysis process, saving time and providing valuable insights into your resort's performance. By following this guide, you'll be able to efficiently track COGs across all outlets and make informed decisions based on accurate, up-to-date information.

The system's dynamic adjustment capability ensures that COGs targets remain realistic as revenue fluctuates, while the comprehensive dashboard provides clear visibility into performance across all outlets.

We recommend starting with a trial period to become familiar with the system before fully transitioning from your current process.
