import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat,
  ArrowBack
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend
);

const OutletDetail = ({ outletId, onBack }) => {
  const [selectedDays, setSelectedDays] = useState(30);
  const [outletData, setOutletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOutletData();
  }, [outletId, selectedDays]);

  const fetchOutletData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/dashboard/outlet/${outletId}?days=${selectedDays}`);
      
      setOutletData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching outlet data:', error);
      setError(error.response?.data?.error || 'Error loading outlet data');
      setLoading(false);
    }
  };

  const handleDaysChange = (event, newValue) => {
    setSelectedDays(newValue);
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
    if (!outletData || !outletData.dailyData || outletData.dailyData.length === 0) {
      return null;
    }

    // Sort data by date
    const sortedData = [...outletData.dailyData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      labels: sortedData.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'COGs Percentage',
          data: sortedData.map(item => item.cogsPercentage),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
        },
        {
          label: 'Target Percentage',
          data: sortedData.map(item => item.adjustedTarget),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderDash: [5, 5],
          fill: false,
        },
      ],
    };
  };

  // Prepare chart data for revenue vs COGs
  const prepareRevenueCogsChartData = () => {
    if (!outletData || !outletData.dailyData || outletData.dailyData.length === 0) {
      return null;
    }

    // Sort data by date
    const sortedData = [...outletData.dailyData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      labels: sortedData.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Revenue',
          data: sortedData.map(item => item.revenue),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y',
        },
        {
          label: 'COGs',
          data: sortedData.map(item => item.cost),
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          yAxisID: 'y',
        },
      ],
    };
  };

  // Chart options
  const cogsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'COGs vs Target Trend',
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

  const revenueCogsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue vs COGs Trend',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Amount ($)'
        }
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={onBack}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1">
          {outletData ? outletData.outlet : 'Outlet'} Details
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedDays}
          onChange={handleDaysChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Last 7 Days" value={7} />
          <Tab label="Last 30 Days" value={30} />
          <Tab label="Last 90 Days" value={90} />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      ) : outletData ? (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Average COGs %
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatPercentage(outletData.rollingAverage)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Trend Direction
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5" component="div" sx={{ mr: 1 }}>
                      {outletData.trendDirection.charAt(0).toUpperCase() + outletData.trendDirection.slice(1)}
                    </Typography>
                    {getTrendIcon(outletData.trendDirection)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Days Over Target
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="div"
                    color={outletData.daysOverTarget > 0 ? 'error' : 'success'}
                  >
                    {outletData.daysOverTarget} / {outletData.dailyData.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    % Days Over Target
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="div"
                    color={outletData.percentageOverTarget > 20 ? 'error' : 'success'}
                  >
                    {formatPercentage(outletData.percentageOverTarget)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  COGs % vs Target
                </Typography>
                <Box sx={{ height: 300 }}>
                  {prepareCogsChartData() && (
                    <Line data={prepareCogsChartData()} options={cogsChartOptions} />
                  )}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Revenue vs COGs
                </Typography>
                <Box sx={{ height: 300 }}>
                  {prepareRevenueCogsChartData() && (
                    <Line data={prepareRevenueCogsChartData()} options={revenueCogsChartOptions} />
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Daily Data Table */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Performance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">COGs</TableCell>
                    <TableCell align="right">COGs %</TableCell>
                    <TableCell align="right">Target %</TableCell>
                    <TableCell align="right">Variance</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outletData.dailyData.sort((a, b) => new Date(b.date) - new Date(a.date)).map((day, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        backgroundColor: day.status === 'OVER TARGET' ? 'rgba(255, 0, 0, 0.05)' : 'inherit'
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {new Date(day.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(day.revenue)}</TableCell>
                      <TableCell align="right">{formatCurrency(day.cost)}</TableCell>
                      <TableCell align="right">{formatPercentage(day.cogsPercentage)}</TableCell>
                      <TableCell align="right">{formatPercentage(day.adjustedTarget)}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{ color: day.variance >= 0 ? 'success.main' : 'error.main' }}
                      >
                        {day.variance >= 0 ? '+' : ''}{formatPercentage(day.variance)}
                      </TableCell>
                      <TableCell>
                        <Typography color={day.status === 'WITHIN TARGET' ? 'success.main' : 'error.main'}>
                          {day.status}
                        </Typography>
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
          No data available for this outlet.
        </Alert>
      )}
    </Container>
  );
};

export default OutletDetail;
