import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
  TextField,
  CircularProgress
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(`/api/dashboard?date=${formattedDate}`);
      
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.error || 'Error loading dashboard data');
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  // Get status color
  const getStatusColor = (status) => {
    return status === 'WITHIN TARGET' ? 'success.main' : 'error.main';
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp color="error" />;
      case 'decreasing':
        return <TrendingDown color="success" />;
      default:
        return <TrendingFlat color="info" />;
    }
  };

  // Prepare chart data for COGs trend
  const prepareCogsChartData = () => {
    if (!dashboardData || !dashboardData.outlets || dashboardData.outlets.length === 0) {
      return null;
    }

    // Get unique outlet names
    const outlets = [...new Set(dashboardData.outlets.map(item => item.outlet))];
    
    // Generate random colors for each outlet
    const colors = outlets.map(() => {
      const r = Math.floor(Math.random() * 200);
      const g = Math.floor(Math.random() * 200);
      const b = Math.floor(Math.random() * 200);
      return `rgba(${r}, ${g}, ${b}, 0.7)`;
    });

    return {
      labels: outlets,
      datasets: [
        {
          label: 'COGs Percentage',
          data: dashboardData.outlets.map(item => item.cogsPercentage),
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
        {
          label: 'Target Percentage',
          data: dashboardData.outlets.map(item => item.adjustedTarget),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          type: 'line',
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'COGs vs Target by Outlet',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Percentage (%)'
        }
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          COGs Analysis Dashboard
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        ) : dashboardData ? (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h5" component="div">
                      {formatCurrency(dashboardData.summary.totalRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total COGs
                    </Typography>
                    <Typography variant="h5" component="div">
                      {formatCurrency(dashboardData.summary.totalCost)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Overall COGs %
                    </Typography>
                    <Typography variant="h5" component="div">
                      {formatPercentage(dashboardData.summary.overallCogsPercentage)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Outlets Over Target
                    </Typography>
                    <Typography 
                      variant="h5" 
                      component="div"
                      color={dashboardData.summary.outletsOverTarget > 0 ? 'error' : 'success'}
                    >
                      {dashboardData.summary.outletsOverTarget} / {dashboardData.outlets.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Alerts Section */}
            {dashboardData.alerts && dashboardData.alerts.length > 0 && (
              <Paper sx={{ p: 2, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Alerts
                </Typography>
                {dashboardData.alerts.map((alert, index) => (
                  <Alert 
                    key={index} 
                    severity="warning"
                    sx={{ mb: 1 }}
                  >
                    <AlertTitle>{alert.Outlet?.name || 'Outlet'} - {new Date(alert.date).toLocaleDateString()}</AlertTitle>
                    COGs: {formatPercentage(alert.actualPercentage)} vs Target: {formatPercentage(alert.targetPercentage)}
                  </Alert>
                ))}
              </Paper>
            )}
            
            {/* Chart Section */}
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                COGs Performance
              </Typography>
              <Box sx={{ height: 300, mb: 4 }}>
                {prepareCogsChartData() && (
                  <Bar data={prepareCogsChartData()} options={chartOptions} />
                )}
              </Box>
            </Paper>
            
            {/* Outlets Table */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Outlet Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Outlet</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">COGs</TableCell>
                      <TableCell align="right">COGs %</TableCell>
                      <TableCell align="right">Target %</TableCell>
                      <TableCell align="right">Variance</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.outlets.map((outlet, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          backgroundColor: outlet.status === 'OVER TARGET' ? 'rgba(255, 0, 0, 0.05)' : 'inherit'
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {outlet.outlet}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(outlet.revenue)}</TableCell>
                        <TableCell align="right">{formatCurrency(outlet.cost)}</TableCell>
                        <TableCell align="right">{formatPercentage(outlet.cogsPercentage)}</TableCell>
                        <TableCell align="right">{formatPercentage(outlet.adjustedTarget)}</TableCell>
                        <TableCell 
                          align="right"
                          sx={{ color: outlet.variance >= 0 ? 'success.main' : 'error.main' }}
                        >
                          {outlet.variance >= 0 ? '+' : ''}{formatPercentage(outlet.variance)}
                        </TableCell>
                        <TableCell align="center">
                          {outlet.status === 'WITHIN TARGET' ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Warning color="error" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            No data available for the selected date.
          </Alert>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default Dashboard;
