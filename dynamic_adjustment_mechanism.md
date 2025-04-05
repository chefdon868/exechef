# Dynamic Adjustment Mechanism for COGs Analysis

## Overview
This document outlines the dynamic adjustment mechanism that will automatically adjust Cost of Goods (COGs) allowances when revenue changes. This is a critical component of the automated COGs analysis system, ensuring that COGs targets remain realistic and achievable as business conditions fluctuate.

## Adjustment Principles

### 1. Revenue-Based Scaling
As revenue increases or decreases, COGs allowances should scale proportionally but not necessarily linearly. The system implements the following scaling principles:

- **Lower Revenue Threshold**: When revenue falls below a certain threshold, COGs percentage targets may be adjusted upward to account for fixed costs representing a larger portion of total costs.
- **Standard Revenue Range**: Within the expected revenue range, standard COGs percentage targets apply.
- **Higher Revenue Threshold**: When revenue exceeds expectations, economies of scale may allow for slightly lower COGs percentage targets.

### 2. Seasonal Adjustments
While the user indicated no significant seasonal factors, the system includes the capability to implement seasonal adjustments if needed in the future:

- **High Season**: During peak periods, higher volume may enable lower COGs percentages.
- **Low Season**: During slower periods, higher COGs percentages may be acceptable.

### 3. Trend-Based Adjustments
The system analyzes recent COGs performance to identify trends and adjust expectations accordingly:

- **Rolling Average**: Uses 7-day rolling average to smooth daily fluctuations.
- **Trend Detection**: Identifies upward or downward trends in COGs percentages.
- **Adaptive Targets**: Gradually adjusts targets based on sustained trends.

## Implementation in Google Sheets

### Revenue Threshold Formulas

#### Basic Revenue Threshold Formula
```
=IF(Revenue < LowerThreshold, 
    StandardTarget * LowerAdjustmentFactor, 
    IF(Revenue > UpperThreshold, 
        StandardTarget * UpperAdjustmentFactor, 
        StandardTarget))
```

#### Implementation in Settings Sheet
The Settings sheet will include a table for revenue thresholds and adjustment factors:

| Outlet | Standard Target | Lower Threshold | Lower Adjustment | Upper Threshold | Upper Adjustment |
|--------|----------------|-----------------|------------------|-----------------|------------------|
| COPRA  | 25%            | $1,000          | 1.10 (27.5%)     | $5,000          | 0.95 (23.75%)    |
| BARAVI | 25%            | $800            | 1.10 (27.5%)     | $4,000          | 0.95 (23.75%)    |
| etc.   | ...            | ...             | ...              | ...             | ...              |

#### Google Sheets Formula for Dynamic Target
```
=VLOOKUP(OutletName, Settings!A:F, 2, FALSE) * 
 IF(Revenue < VLOOKUP(OutletName, Settings!A:F, 3, FALSE), 
    VLOOKUP(OutletName, Settings!A:F, 4, FALSE), 
    IF(Revenue > VLOOKUP(OutletName, Settings!A:F, 5, FALSE), 
       VLOOKUP(OutletName, Settings!A:F, 6, FALSE), 
       1))
```

### Trend Analysis Formulas

#### 7-Day Rolling Average
```
=AVERAGE(QUERY(OutletSheet!D:D, "SELECT D WHERE A >= date '"&TEXT(TODAY()-7,"yyyy-mm-dd")&"' AND A <= date '"&TEXT(TODAY(),"yyyy-mm-dd")&"'"))
```

#### Trend Detection
```
=IF(TODAY7DayAvg > PREVIOUS7DayAvg * 1.05, "UPWARD", 
    IF(TODAY7DayAvg < PREVIOUS7DayAvg * 0.95, "DOWNWARD", 
    "STABLE"))
```

#### Adaptive Target Adjustment
```
=IF(TrendDirection = "UPWARD" AND ConsecutiveDaysUp >= 3, 
    StandardTarget * 1.02, 
    IF(TrendDirection = "DOWNWARD" AND ConsecutiveDaysDown >= 3, 
       StandardTarget * 0.98, 
       StandardTarget))
```

### Alert Thresholds

The system will generate alerts when actual COGs percentages exceed adjusted targets by a significant margin:

#### Alert Formula
```
=IF(ActualCOGsPercentage > AdjustedTarget * AlertThreshold, "ALERT", "OK")
```

Where `AlertThreshold` is typically set to 1.10 (110% of target) but can be customized in the Settings sheet.

## Google Apps Script Implementation

The dynamic adjustment mechanism will be supported by Google Apps Script functions:

### Calculate Adjusted Targets
```javascript
function calculateAdjustedTargets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName('Settings');
  var outletSheets = getOutletSheets();
  
  // For each outlet, calculate adjusted targets based on revenue
  for (var i = 0; i < outletSheets.length; i++) {
    var outletName = outletSheets[i];
    var outletSheet = ss.getSheetByName(outletName);
    
    // Get outlet settings
    var outletSettings = getOutletSettings(outletName);
    
    // Get revenue data
    var revenueData = getRevenueData(outletName);
    
    // Calculate adjusted targets
    var adjustedTargets = [];
    for (var j = 0; j < revenueData.length; j++) {
      var revenue = revenueData[j].revenue;
      var date = revenueData[j].date;
      
      var adjustedTarget = calculateAdjustedTarget(
        revenue, 
        outletSettings.standardTarget,
        outletSettings.lowerThreshold,
        outletSettings.lowerAdjustment,
        outletSettings.upperThreshold,
        outletSettings.upperAdjustment
      );
      
      adjustedTargets.push({
        date: date,
        adjustedTarget: adjustedTarget
      });
    }
    
    // Update the outlet sheet with adjusted targets
    updateAdjustedTargets(outletName, adjustedTargets);
  }
}

function calculateAdjustedTarget(revenue, standardTarget, lowerThreshold, lowerAdjustment, upperThreshold, upperAdjustment) {
  if (revenue < lowerThreshold) {
    return standardTarget * lowerAdjustment;
  } else if (revenue > upperThreshold) {
    return standardTarget * upperAdjustment;
  } else {
    return standardTarget;
  }
}
```

### Analyze Trends
```javascript
function analyzeTrends() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var outletSheets = getOutletSheets();
  
  // For each outlet, analyze COGs percentage trends
  for (var i = 0; i < outletSheets.length; i++) {
    var outletName = outletSheets[i];
    var outletSheet = ss.getSheetByName(outletName);
    
    // Get historical COGs data
    var cogsData = getHistoricalCogsData(outletName, 14); // Last 14 days
    
    // Calculate 7-day rolling averages
    var current7DayAvg = calculateRollingAverage(cogsData, 0, 7);
    var previous7DayAvg = calculateRollingAverage(cogsData, 7, 14);
    
    // Determine trend direction
    var trendDirection = "STABLE";
    if (current7DayAvg > previous7DayAvg * 1.05) {
      trendDirection = "UPWARD";
    } else if (current7DayAvg < previous7DayAvg * 0.95) {
      trendDirection = "DOWNWARD";
    }
    
    // Update trend information in the outlet sheet
    updateTrendInfo(outletName, current7DayAvg, previous7DayAvg, trendDirection);
  }
}

function calculateRollingAverage(data, startIndex, endIndex) {
  var sum = 0;
  var count = 0;
  
  for (var i = startIndex; i < endIndex && i < data.length; i++) {
    sum += data[i].cogsPercentage;
    count++;
  }
  
  return count > 0 ? sum / count : 0;
}
```

## User Interface Elements

### Settings Sheet UI
The Settings sheet will include:

1. **Revenue Threshold Table**: For configuring revenue-based adjustments
2. **Trend Analysis Settings**: For configuring trend detection parameters
3. **Alert Threshold Settings**: For configuring when alerts should be triggered

### Outlet Sheet UI
Each outlet sheet will include:

1. **Standard Target**: The base COGs percentage target
2. **Adjusted Target**: The dynamically adjusted target based on revenue
3. **Trend Indicator**: Visual indicator of the current trend direction
4. **Alert Status**: Visual indicator when COGs exceeds adjusted target

### Master Dashboard UI
The Master Dashboard will include:

1. **Adjustment Summary**: Overview of all outlets with their standard and adjusted targets
2. **Trend Summary**: Overview of trend directions for all outlets
3. **Alert Summary**: List of outlets currently exceeding their adjusted targets

## Implementation Steps

1. Add revenue threshold configuration to Settings sheet
2. Implement dynamic target calculation formulas in outlet sheets
3. Add trend analysis calculations to outlet sheets
4. Implement alert threshold logic
5. Update Google Apps Script to support dynamic adjustments
6. Add visualization elements to clearly show adjustments and trends
7. Test with various revenue scenarios to verify proper adjustment behavior
