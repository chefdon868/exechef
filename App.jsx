import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard';
import OutletDetail from './components/OutletDetail';
import DataImport from './components/DataImport';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import axios from 'axios';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Set up axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      // Set axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    
    // Set axios auth header
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  const handleLogout = () => {
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove axios auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset user state
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            user ? <Navigate to="/" /> : <Login onLoginSuccess={handleLogin} />
          } />
          
          {/* Protected routes */}
          <Route path="/" element={
            user ? (
              <MainLayout user={user} onLogout={handleLogout}>
                <Dashboard />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          <Route path="/outlet/:id" element={
            user ? (
              <MainLayout user={user} onLogout={handleLogout}>
                <OutletDetail />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          <Route path="/import" element={
            user ? (
              <MainLayout user={user} onLogout={handleLogout}>
                <DataImport />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
