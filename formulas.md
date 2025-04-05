# Google Sheets Formulas for COGs Analysis System

## Revenue Import Sheet

### IMPORTRANGE Formula (if Flash Report is in Google Sheets)
```
=IMPORTRANGE("URL_OF_FLASH_REPORT", "Sheet1!A1:Z100")
```

### QUERY to Extract Revenue by Outlet
```
=QUERY(A:Z, "SELECT A, B, C WHERE B = 'OUTLET_NAME'")
```

## Outlet Sheets

### Pull Revenue Data from Revenue Import Sheet
```
=QUERY('Revenue_Import'!A:E, "SELECT A, D WHERE B = 'OUTLET_NAME' AND A = date '"&TEXT(TODAY(),"yyyy-mm-dd")&"'")
```

### Pull Procurement Data from Procurement Import Sheet
```
=QUERY('Procurement_Import'!A:H, "SELECT A, SUM(G) WHERE B = 'OUTLET_NAME' AND A = date '"&TEXT(TODAY(),"yyyy-mm-dd")&"' GROUP BY A")
```

### Calculate COGs Percentage
```
=IF(B2>0, C2/B2, 0)
```

### Get Target Percentage from Settings
```
=VLOOKUP("OUTLET_NAME", Settings!A:B, 2, FALSE)
```

### Calculate Variance from Target
```
=D2-E2
```

### Status Indicator (Conditional)
```
=IF(F2>0, "OVER TARGET", "WITHIN TARGET")
```

## Master Dashboard

### Summary Table with QUERY
```
=QUERY({OUTLET1!A:G; OUTLET2!A:G; OUTLET3!A:G}, "SELECT Col1, Col2, Col3, Col4, Col5, Col6, Col7 WHERE Col1 = date '"&TEXT(TODAY(),"yyyy-mm-dd")&"'")
```

### Conditional Formatting for Status
Apply conditional formatting to the Status column:
- Formula: =H2="OVER TARGET"
- Format: Red background

### Sparkline for Trend Visualization
```
=SPARKLINE(QUERY(OUTLET1!A:D, "SELECT D WHERE A >= date '"&TEXT(TODAY()-30,"yyyy-mm-dd")&"' AND A <= date '"&TEXT(TODAY(),"yyyy-mm-dd")&"'"))
```

## Dynamic Adjustment Formulas

### Adjusted COGs Target Based on Revenue Level
```
=IF(B2<1000, E2*1.1, IF(B2<5000, E2*1.05, E2))
```

### Projected COGs Based on Current Trend
```
=AVERAGE(QUERY(OUTLET1!D:D, "SELECT D ORDER BY A DESC LIMIT 7"))
```

### Alert Threshold Check
```
=IF(D2>(E2*1.1), "ALERT", "OK")
```
