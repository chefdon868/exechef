const { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../src/components/Login';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('Login Component', () => {
  const mockLoginSuccess = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders login form', () => {
    render(
      <BrowserRouter>
        <Login onLoginSuccess={mockLoginSuccess} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/ExeChef COGs Analysis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Create New Account/i)).toBeInTheDocument();
  });
  
  test('validates form inputs', async () => {
    render(
      <BrowserRouter>
        <Login onLoginSuccess={mockLoginSuccess} />
      </BrowserRouter>
    );
    
    // Submit form without inputs
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });
  
  test('handles successful login', async () => {
    // Mock successful login response
    const mockResponse = {
      data: {
        token: 'test-token',
        user: {
          id: 1,
          username: 'testuser',
          role: 'admin'
        }
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    render(
      <BrowserRouter>
        <Login onLoginSuccess={mockLoginSuccess} />
      </BrowserRouter>
    );
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Wait for login to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user));
      expect(mockLoginSuccess).toHaveBeenCalledWith(mockResponse.data.user);
    });
  });
  
  test('handles login error', async () => {
    // Mock login error
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Invalid username or password'
        }
      }
    });
    
    render(
      <BrowserRouter>
        <Login onLoginSuccess={mockLoginSuccess} />
      </BrowserRouter>
    );
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument();
      expect(mockLoginSuccess).not.toHaveBeenCalled();
    });
  });
  
  test('switches to registration form', () => {
    render(
      <BrowserRouter>
        <Login onLoginSuccess={mockLoginSuccess} />
      </BrowserRouter>
    );
    
    // Click register button
    fireEvent.click(screen.getByText(/Create New Account/i));
    
    // Check if registration form is displayed
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByText(/Back to Login/i)).toBeInTheDocument();
  });
  
  test('validates registration form', async () => {
    render(
      <BrowserRouter>
        <Login onLoginSuccess={mockLoginSuccess} />
      </BrowserRouter>
    );
    
    // Switch to registration form
    fireEvent.click(screen.getByText(/Create New Account/i));
    
    // Submit form without inputs
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    
    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Confirm password is required/i)).toBeInTheDocument();
    });
  });
});
