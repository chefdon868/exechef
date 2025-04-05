import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import { UploadFile, DataArray, Check } from '@mui/icons-material';
import axios from 'axios';

const steps = ['Upload File', 'Map Columns', 'Review & Import'];

const DataImport = ({ importType }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [columnMapping, setColumnMapping] = useState({
    dateColumn: '',
    outletColumn: '',
    categoryColumn: '',
    amountColumn: '',
    notesColumn: ''
  });
  const [procurementMapping, setProcurementMapping] = useState({
    dateColumn: '',
    outletColumn: '',
    itemCategoryColumn: '',
    itemDescriptionColumn: '',
    quantityColumn: '',
    unitCostColumn: '',
    totalCostColumn: '',
    notesColumn: ''
  });
  const [importResults, setImportResults] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      validateFile(selectedFile);
    }
  };

  const validateFile = async (selectedFile) => {
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await axios.post('/api/import/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFileData(response.data);
      setLoading(false);
      setActiveStep(1);
    } catch (error) {
      setError(error.response?.data?.error || 'Error validating file');
      setLoading(false);
    }
  };

  const handleSheetChange = (event) => {
    setSelectedSheet(event.target.value);
  };

  const handleColumnMappingChange = (field, value) => {
    if (importType === 'revenue') {
      setColumnMapping({
        ...columnMapping,
        [field]: value
      });
    } else {
      setProcurementMapping({
        ...procurementMapping,
        [field]: value
      });
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Validate mapping before proceeding
      if (importType === 'revenue') {
        if (!columnMapping.dateColumn || !columnMapping.outletColumn || !columnMapping.amountColumn) {
          setError('Date, Outlet, and Amount columns are required');
          return;
        }
      } else {
        if (!procurementMapping.dateColumn || !procurementMapping.outletColumn || 
            !procurementMapping.totalCostColumn) {
          setError('Date, Outlet, and Total Cost columns are required');
          return;
        }
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleImport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sheetIndex', selectedSheet);
    
    if (importType === 'revenue') {
      // Add revenue mapping
      Object.keys(columnMapping).forEach(key => {
        formData.append(key, columnMapping[key]);
      });
      
      try {
        const response = await axios.post('/api/import/revenue', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setImportResults(response.data);
        setSuccess(`Successfully imported ${response.data.count} revenue records`);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.error || 'Error importing revenue data');
        setLoading(false);
      }
    } else {
      // Add procurement mapping
      Object.keys(procurementMapping).forEach(key => {
        formData.append(key, procurementMapping[key]);
      });
      
      try {
        const response = await axios.post('/api/import/procurement', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setImportResults(response.data);
        setSuccess(`Successfully imported ${response.data.count} procurement records`);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.error || 'Error importing procurement data');
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setFileData(null);
    setColumnMapping({
      dateColumn: '',
      outletColumn: '',
      categoryColumn: '',
      amountColumn: '',
      notesColumn: ''
    });
    setProcurementMapping({
      dateColumn: '',
      outletColumn: '',
      itemCategoryColumn: '',
      itemDescriptionColumn: '',
      quantityColumn: '',
      unitCostColumn: '',
      totalCostColumn: '',
      notesColumn: ''
    });
    setImportResults(null);
    setError('');
    setSuccess('');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Upload {importType === 'revenue' ? 'Revenue' : 'Procurement'} Data File
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Upload an Excel (.xlsx, .xls) or CSV file containing your {importType === 'revenue' ? 'revenue' : 'procurement'} data.
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFile />}
              sx={{ mt: 2 }}
            >
              Select File
              <input
                type="file"
                hidden
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Selected file: {file.name}
              </Typography>
            )}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Map Columns
            </Typography>
            
            {fileData?.sheets && fileData.sheets.length > 1 && (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Sheet</InputLabel>
                <Select
                  value={selectedSheet}
                  label="Sheet"
                  onChange={handleSheetChange}
                >
                  {fileData.sheets.map((sheet) => (
                    <MenuItem key={sheet.index} value={sheet.index}>
                      {sheet.name} ({sheet.rowCount} rows)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Map the columns from your file to the required fields.
            </Typography>
            
            <Grid container spacing={2}>
              {importType === 'revenue' ? (
                // Revenue mapping fields
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Date Column</InputLabel>
                      <Select
                        value={columnMapping.dateColumn}
                        label="Date Column *"
                        onChange={(e) => handleColumnMappingChange('dateColumn', e.target.value)}
                      >
                        {fileData?.headers.map((header) => (
                          <MenuItem key={header.name} value={header.name}>
                            {header.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Outlet Column</InputLabel>
                      <Select
                        value={columnMapping.outletColumn}
                        label="Outlet Column *"
                        onChange={(e) => handleColumnMappingChange('outletColumn', e.target.value)}
                      >
                        {fileData?.headers.map((header) => (
                          <MenuItem key={header.name} value={header.name}>
                            {header.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category Column</InputLabel>
                      <Select
                        value={columnMapping.categoryColumn}
                        label="Category Column"
                        onChange={(e) => handleColumnMappingChange('categoryColumn', e.target.value)}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {fileData?.headers.map((header) => (
                          <MenuItem key={header.name} value={header.name}>
                            {header.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Amount Column</InputLabel>
                      <Select
                        value={columnMapping.amountColumn}
                        label="Amount Column *"
                        onChange={(e) => handleColumnMappingChange('amountColumn', e.target.value)}
                      >
                        {fileData?.headers.map((header) => (
                          <MenuItem key={header.name} value={header.name}>
                            {header.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Notes Column</InputLabel>
                      <Select
                        value={columnMapping.notesColumn}
                        label="Notes Column"
                        onChange={(e) => handleColumnMappingChange('notesColumn', e.target.value)}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {fileData?.headers.map((header) => (
                          <MenuItem key={header.name} value={header.name}>
                            {header.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                // Procurement mapping fields
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Date Column</InputLabel>
                      <Select
                        value={procurementMapping.dateColumn}
                        label="Date Column *"
                        onChange={(e) => handleColumnMappingChange('dateColumn', e.target.value)}
                      >
                        {fileData?.headers.map((header) => (
                          <MenuItem key={header.name} value={header.name}>
                            {header.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Outlet Column</InputLabel>
                      <Select
                        value={procurementMapping.outletColumn}
                        label="Outlet Column *"
                        onChange={(e) => handleColumnMappingChange('outletColumn', e.target.value)}
                      >
                        {fileData?.headers.map((header) => (
                          <MenuItem key={header.name} value={header.name}>
                            {header.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Item Category Column</InputLabel>
                      <Select
                        value={procurementMapping.itemCategoryColumn}
                        label="Item Category Column"
                        onChange={(e) => handleColumnMappingChange('itemCategoryColumn', e.target.value)}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {fileData?.headers.map((header) => (
                          <MenuItem key={header.name} value={header.name}>
                            {header.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Item Description Column</InputLabel>
                      <Select
                        value={procurementMapping.itemDescriptionColumn}
                        label="Item Description Column"
                        onChange={(e) => handleColumnMappingChange('itemDescriptionColumn', e.target.value)}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {fileData?.headers.map((header) => (
                          <MenuItem key={header.name} value={header.name}>
                            {header.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Quantity Column</InputLabel>
                      <Select
                        value={procurementMapping.quantityColumn}
                        label="Quantity Column"
                        onChange={(e) => handleColumnMappingChange('quantityColumn', e.target.value)}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {fileData?.headers.map((header) => (
                          <MenuItem key={header.name} value={header.name}>
                            {h
(Content truncated due to size limit. Use line ranges to read in chunks)