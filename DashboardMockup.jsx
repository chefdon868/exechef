import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, AlertTitle, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
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

// Register Chart.js components
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

// Create a mockup of the dashboard UI with sample data
const DashboardMockup = () => {
  const [loading, setLoading] = useState(true);
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Sample data for the mockup
  const mockData = {
    outlets: [
      { name: 'COPRA', revenue: 2500, cost: 600, percentage: 24, target: 25, status: 'WITHIN_TARGET' },
      { name: 'BARAVI', revenue: 1800, cost: 468, percentage: 26, target: 25, status: 'OVER_TARGET' },
      { name: 'BLACK CORAL', revenue: 3200, cost: 768, percentage: 24, target: 25, status: 'WITHIN_TARGET' },
      { name: 'TOBA', revenue: 1200, cost: 324, percentage: 27, target: 25, status: 'OVER_TARGET' },
    ],
    summary: {
      totalRevenue: 8700,
      totalCost: 2160,
      overallPercentage: 24.8,
      outletsOverTarget: 2,
      totalOutlets: 4
    },
    alerts: [
      { id: 1, outlet: 'BARAVI', date: '2025-04-03', percentage: 26, target: 25 },
      { id: 2, outlet: 'TOBA', date: '2025-04-03', percentage: 27, target: 25 }
    ]
  };
  
  // Chart data for bar chart
  const barChartData = {
    labels: mockData.outlets.map(outlet => outlet.name),
    datasets: [
      {
        label: 'COGs %',
        data: mockData.outlets.map(outlet => outlet.percentage),
        backgroundColor: mockData.outlets.map(outlet => 
          outlet.status === 'OVER_TARGET' ? 'rgba(255, 99, 132, 0.6)' : 'rgba(54, 162, 235, 0.6)'
        ),
        borderColor: mockData.outlets.map(outlet => 
          outlet.status === 'OVER_TARGET' ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)'
        ),
        borderWidth: 1,
      },
      {
        label: 'Target %',
        data: mockData.outlets.map(outlet => outlet.target),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 1,
        type: 'line',
      }
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'COGs % by Outlet',
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
  
  // Styled components
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }));
  
  const StatValue = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: '1.8rem',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  }));
  
  const StatLabel = styled(Typography)(({ theme }) => ({
    fontSize: '1rem',
    color: theme.palette.text.secondary,
  }));
  
  const AlertItem = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    borderLeft: `4px solid ${theme.palette.error.main}`,
    backgroundColor: theme.palette.error.light,
    borderRadius: theme.shape.borderRadius,
  }));
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'medium', color: 'primary.main' }}>
        ExeChef COGs Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
        Daily Cost of Goods Analysis - April 3, 2025
      </Typography>
      
      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <StatLabel>Total Revenue</StatLabel>
            <StatValue>${mockData.summary.totalRevenue.toLocaleString()}</StatValue>
          </Item>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <StatLabel>Total COGs</StatLabel>
            <StatValue>${mockData.summary.totalCost.toLocaleString()}</StatValue>
          </Item>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <StatLabel>Overall COGs %</StatLabel>
            <StatValue>{mockData.summary.overallPercentage.toFixed(1)}%</StatValue>
          </Item>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Item>
            <StatLabel>Outlets Over Target</StatLabel>
            <StatValue>{mockData.summary.outletsOverTarget} / {mockData.summary.totalOutlets}</StatValue>
          </Item>
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Outlet Performance
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={barChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        
        {/* Alerts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alerts
            </Typography>
            {mockData.alerts.length > 0 ? (
              mockData.alerts.map(alert => (
                <AlertItem key={alert.id}>
                  <Typography variant="subtitle2">
                    {alert.outlet} - {alert.date}
                  </Typography>
                  <Typography variant="body2">
                    COGs: {alert.percentage}% (Target: {alert.target}%)
                  </Typography>
                </AlertItem>
              ))
            ) : (
              <Typography variant="body2">No alerts today</Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Outlet Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Outlet Details
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Outlet</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Revenue</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>COGs</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>COGs %</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Target %</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Variance</th>
                    <th style={{ textAlign: 'center', padding: '8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.outlets.map((outlet, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ textAlign: 'left', padding: '8px' }}>{outlet.name}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>${outlet.revenue.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>${outlet.cost.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{outlet.percentage}%</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{outlet.target}%</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{(outlet.target - outlet.percentage).toFixed(1)}%</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>
                        <Box sx={{ 
                          display: 'inline-block', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1, 
                          bgcolor: outlet.status === 'OVER_TARGET' ? 'error.light' : 'success.light',
                          color: outlet.status === 'OVER_TARGET' ? 'error.dark' : 'success.dark',
                        }}>
                          {outlet.status === 'OVER_TARGET' ? 'Over Target' : 'Within Target'}
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardMockup;
