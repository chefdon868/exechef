# Reporting Dashboard for COGs Analysis System

## Overview
This document outlines the reporting dashboard design for the automated COGs analysis system. The dashboard will provide a comprehensive view of COGs performance across all outlets, with visualizations that highlight trends, variances, and alerts.

## Dashboard Components

### 1. Main Summary Dashboard

#### Key Performance Indicators (KPIs)
- **Overall COGs Performance**: Weighted average COGs percentage across all outlets
- **Outlets Over Target**: Count and list of outlets exceeding their adjusted targets
- **Trend Indicator**: Overall trend direction (improving/stable/worsening)
- **Daily Revenue Total**: Sum of revenue across all outlets
- **Daily COGs Total**: Sum of COGs across all outlets

#### Daily Performance Table
| Outlet | Revenue | COGs | Actual % | Target % | Adjusted % | Variance | Status |
|--------|---------|------|----------|----------|------------|----------|--------|
| COPRA  | $2,500  | $600 | 24.0%    | 25.0%    | 25.0%      | +1.0%    | ✓      |
| BARAVI | $1,800  | $500 | 27.8%    | 25.0%    | 27.5%      | -0.3%    | ✓      |
| etc.   | ...     | ...  | ...      | ...      | ...        | ...      | ...    |

#### Implementation in Google Sheets
```
=QUERY({COPRA!A:G; BARAVI!A:G; 'BLACK CORAL'!A:G; TAVOLA!A:G; POKE!A:G; BATABATA!A:G; 'LOMANI '!A:G; 'FGH - PALM COURT'!A:G}, 
       "SELECT Col2, Col3, Col4, Col5, Col6, Col7 
        WHERE Col1 = date '"&TEXT(Dashboard!A1,"yyyy-mm-dd")&"'
        ORDER BY Col7 DESC")
```

### 2. Trend Visualization Section

#### 7-Day Trend Chart
A line chart showing the 7-day trend of COGs percentages for each outlet:

```
=SPARKLINE(QUERY(COPRA!A:D, 
                "SELECT D 
                 WHERE A >= date '"&TEXT(TODAY()-7,"yyyy-mm-dd")&"' 
                 AND A <= date '"&TEXT(TODAY(),"yyyy-mm-dd")&"'"))
```

#### Month-to-Date Performance
A bar chart comparing month-to-date average COGs percentage against target for each outlet:

```
=QUERY(COPRA!A:E, 
      "SELECT AVG(D) 
       WHERE A >= date '"&TEXT(DATE(YEAR(TODAY()),MONTH(TODAY()),1),"yyyy-mm-dd")&"' 
       AND A <= date '"&TEXT(TODAY(),"yyyy-mm-dd")&"'")
```

#### Revenue vs. COGs Correlation
A scatter plot showing the relationship between daily revenue and COGs percentage:

```
=QUERY(COPRA!A:D, 
      "SELECT B, D 
       WHERE A >= date '"&TEXT(TODAY()-30,"yyyy-mm-dd")&"' 
       AND A <= date '"&TEXT(TODAY(),"yyyy-mm-dd")&"'")
```

### 3. Outlet-Specific Dashboards

Each outlet will have a dedicated dashboard section showing:

#### Daily Performance Table
| Date       | Revenue | COGs | Actual % | Target % | Adjusted % | Variance | Status |
|------------|---------|------|----------|----------|------------|----------|--------|
| 2025-04-01 | $2,300  | $575 | 25.0%    | 25.0%    | 25.0%      | 0.0%     | ✓      |
| 2025-04-02 | $2,500  | $600 | 24.0%    | 25.0%    | 25.0%      | +1.0%    | ✓      |
| 2025-04-03 | $1,800  | $500 | 27.8%    | 25.0%    | 27.5%      | -0.3%    | ✓      |
| etc.       | ...     | ...  | ...      | ...      | ...        | ...      | ...    |

#### 30-Day Trend Chart
A line chart showing the 30-day trend of:
- Actual COGs percentage
- Target COGs percentage
- Adjusted target COGs percentage

#### Revenue Impact Visualization
A chart showing how revenue fluctuations impact COGs percentages and adjusted targets.

### 4. Alert Dashboard

A dedicated section for monitoring outlets that require attention:

#### Alert Table
| Outlet | Days Over Target | Current % | Adjusted Target % | Variance | Trend |
|--------|------------------|-----------|-------------------|----------|-------|
| BARAVI | 3                | 27.8%     | 25.0%             | -2.8%    | ↑     |
| etc.   | ...              | ...       | ...               | ...      | ...   |

#### Implementation in Google Sheets
```
=QUERY({COPRA!A:G; BARAVI!A:G; 'BLACK CORAL'!A:G; TAVOLA!A:G; POKE!A:G; BATABATA!A:G; 'LOMANI '!A:G; 'FGH - PALM COURT'!A:G}, 
       "SELECT Col2, Col3, Col4, Col5, Col6, Col7 
        WHERE Col7 = 'OVER TARGET'
        ORDER BY Col6 ASC")
```

## Dashboard Design Elements

### 1. Conditional Formatting

#### Status Indicators
- **Green**: COGs percentage is below adjusted target
- **Yellow**: COGs percentage is within 1% of adjusted target
- **Red**: COGs percentage exceeds adjusted target

#### Trend Indicators
- **Green Arrow Up**: Improving trend (COGs percentage decreasing)
- **Yellow Horizontal Arrow**: Stable trend
- **Red Arrow Down**: Worsening trend (COGs percentage increasing)

### 2. Interactive Elements

#### Date Selector
A date picker allowing users to view dashboard data for any specific date:

```
// In Google Apps Script
function updateDashboardDate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName('Master_Dashboard');
  var dateCell = dashboard.getRange('A1');
  var selectedDate = dateCell.getValue();
  
  // Update all dashboard elements based on selected date
  updateDashboardForDate(selectedDate);
}
```

#### Outlet Filter
A dropdown menu to filter the dashboard to show only specific outlets:

```
// In Google Apps Script
function filterDashboardByOutlet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName('Master_Dashboard');
  var outletCell = dashboard.getRange('C1');
  var selectedOutlet = outletCell.getValue();
  
  // Filter dashboard to show only the selected outlet
  filterDashboardToOutlet(selectedOutlet);
}
```

### 3. Data Visualization Techniques

#### Sparklines
For compact trend visualization directly in tables:

```
=SPARKLINE(QUERY(COPRA!D2:D32, "SELECT D ORDER BY A DESC LIMIT 30"))
```

#### Bullet Charts
To show actual performance against target in a compact format:

```
=SPARKLINE(D2, {"charttype","bullet";"max",1;"target",E2;"good",E2;"bad",E2*1.1})
```

#### Heatmap
To highlight days with highest COGs percentages:

```
// Conditional formatting formula
=D2>AVERAGE($D$2:$D$32)*1.1
```

## Implementation in Google Sheets

### 1. Master Dashboard Sheet Layout

```
A1: Date Selector (with date picker data validation)
A3-H3: Column Headers for Summary Table
A4-H11: Summary Table with data from all outlets
A13-G20: 7-Day Trend Visualization
A22-G29: Month-to-Date Performance Chart
A31-G38: Revenue vs. COGs Correlation Chart
```

### 2. Google Apps Script for Dashboard Updates

```javascript
/**
 * Updates all dashboard visualizations
 */
function updateDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName('Master_Dashboard');
  
  // Get selected date
  var dateCell = dashboard.getRange('A1');
  var selectedDate = dateCell.getValue();
  
  // Update summary table
  updateSummaryTable(selectedDate);
  
  // Update trend visualizations
  updateTrendVisualizations(selectedDate);
  
  // Update alert section
  updateAlertSection(selectedDate);
}

/**
 * Updates the summary table with data from all outlets
 */
function updateSummaryTable(date) {
  // Implementation details for updating the summary table
  // This would query data from all outlet sheets for the selected date
}

/**
 * Updates trend visualizations
 */
function updateTrendVisualizations(date) {
  // Implementation details for updating trend charts
  // This would create or update charts based on historical data
}

/**
 * Updates the alert section
 */
function updateAlertSection(date) {
  // Implementation details for updating the alert section
  // This would identify outlets exceeding targets and update the alert table
}
```

### 3. Chart Creation

```javascript
/**
 * Creates or updates a line chart for COGs trends
 */
function createCoGsTrendChart() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName('Master_Dashboard');
  
  // Get data range for chart
  var dataRange = dashboard.getRange('A13:G20');
  
  // Create or update chart
  var charts = dashboard.getCharts();
  var chart = null;
  
  if (charts.length > 0) {
    // Update existing chart
    chart = charts[0];
    chart = chart.modify()
      .asLineChart()
      .addRange(dataRange)
      .setOption('title', 'COGs Percentage Trends')
      .setOption('legend', {position: 'bottom'})
      .setOption('hAxis.title', 'Date')
      .setOption('vAxis.title', 'COGs %')
      .build();
    dashboard.updateChart(chart);
  } else {
    // Create new chart
    chart = dashboard.newChart()
      .asLineChart()
      .addRange(dataRange)
      .setOption('title', 'COGs Percentage Trends')
      .setOption('legend', {position: 'bottom'})
      .setOption('hAxis.title', 'Date')
      .setOption('vAxis.title', 'COGs %')
      .setPosition(13, 1, 0, 0)
      .build();
    dashboard.insertChart(chart);
  }
}
```

## Mobile Optimization

The dashboard will be optimized for mobile viewing with:

1. **Responsive Layout**: Tables and charts that adjust to screen size
2. **Simplified Mobile View**: A dedicated mobile-friendly view with essential KPIs
3. **Touch-Friendly Controls**: Larger buttons and controls for touch interaction

## Implementation Steps

1. Create Master Dashboard sheet with layout structure
2. Implement summary table with data connections to outlet sheets
3. Create trend visualization charts
4. Implement conditional formatting for status indicators
5. Add interactive date selector and outlet filter
6. Create Google Apps Script functions for dashboard updates
7. Test dashboard with sample data
8. Optimize for mobile viewing
9. Add documentation and user instructions
