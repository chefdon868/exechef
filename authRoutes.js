const express = require('express');
const router = express.Router();
const AuthService = require('../services/AuthService');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Register a new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const userData = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role
    };
    
    const user = await AuthService.register(userData);
    
    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Login a user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await AuthService.login(username, password);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error logging in:', error);
    
    if (error.message.includes('Invalid username or password')) {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    // User is attached to request by auth middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
