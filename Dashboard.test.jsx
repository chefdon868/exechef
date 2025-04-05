const { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../src/components/Dashboard';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart" />,
  Line: () => <div data-testid="mock-line-chart" />,
}));

describe('Dashboard Component', () => {
  const mockOnOutletSelect = jest.fn();
  
  // Mock dashboard data
  const mockDashboardData = {
    date: '2025-04-04',
    summary: {
      totalRevenue: 5000,
      totalCost: 1250,
      overallCogsPercentage: 25,
      outletsWithinTarget: 2,
      outletsOverTarget: 1
    },
    outlets: [
      {
        outlet: 'Outlet 1',
        date: '2025-04-04',
        revenue: 2000,
        cost: 400,
        cogsPercentage: 20,
        standardTarget: 25,
        adjustedTarget: 22.5,
        variance: 2.5,
        status: 'WITHIN TARGET'
      },
      {
        outlet: 'Outlet 2',
        date: '2025-04-04',
        revenue: 1500,
        cost: 450,
        cogsPercentage: 30,
        standardTarget: 25,
        adjustedTarget: 25,
        variance: -5,
        status: 'OVER TARGET'
      },
      {
        outlet: 'Outlet 3',
        date: '2025-04-04',
        revenue: 1500,
        cost: 400,
        cogsPercentage: 26.67,
        standardTarget: 25,
        adjustedTarget: 25,
        variance: -1.67,
        status: 'WITHIN TARGET'
      }
    ],
    alerts: [
      {
        id: 1,
        outletId: 2,
        date: '2025-04-04',
        actualPercentage: 30,
        targetPercentage: 25,
        variance: -5,
        status: 'OVER TARGET',
        Outlet: {
          name: 'Outlet 2'
        }
      }
    ]
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API response
    axios.get.mockResolvedValue({ data: mockDashboardData });
  });
  
  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <Dashboard onOutletSelect={mockOnOutletSelect} />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('renders dashboard with data', async () => {
    render(
      <BrowserRouter>
        <Dashboard onOutletSelect={mockOnOutletSelect} />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check summary cards
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
    expect(screen.getByText('Total COGs')).toBeInTheDocument();
    expect(screen.getByText('$1,250.00')).toBeInTheDocument();
    expect(screen.getByText('Overall COGs %')).toBeInTheDocument();
    expect(screen.getByText('25.00%')).toBeInTheDocument();
    expect(screen.getByText('Outlets Over Target')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    
    // Check alerts section
    expect(screen.getByText('Recent Alerts')).toBeInTheDocument();
    expect(screen.getByText('Outlet 2 - 4/4/2025')).toBeInTheDocument();
    
    // Check chart
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    
    // Check outlets table
    expect(screen.getByText('Outlet Performance')).toBeInTheDocument();
    expect(screen.getByText('Outlet 1')).toBeInTheDocument();
    expect(screen.getByText('Outlet 2')).toBeInTheDocument();
    expect(screen.getByText('Outlet 3')).toBeInTheDocument();
  });
  
  test('handles date change', async () => {
    render(
      <BrowserRouter>
        <Dashboard onOutletSelect={mockOnOutletSelect} />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Find date picker and change date
    const datePicker = screen.getByLabelText('Select Date');
    fireEvent.change(datePicker, { target: { value: '2025-04-03' } });
    
    // Check if API was called with new date
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('2025-04-03'));
    });
  });
  
  test('handles API error', async () => {
    // Mock API error
    axios.get.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Failed to load dashboard data'
        }
      }
    });
    
    render(
      <BrowserRouter>
        <Dashboard onOutletSelect={mockOnOutletSelect} />
      </BrowserRouter>
    );
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });
  
  test('handles outlet selection', async () => {
    render(
      <BrowserRouter>
        <Dashboard onOutletSelect={mockOnOutletSelect} />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Find outlet row and click it
    const outletRow = screen.getByText('Outlet 1').closest('tr');
    fireEvent.click(outletRow);
    
    // Check if onOutletSelect was called
    expect(mockOnOutletSelect).toHaveBeenCalled();
  });
});
