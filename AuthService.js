const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Service for handling user authentication
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user object (without password)
   */
  async register(userData) {
    try {
      // Check if username already exists
      const existingUser = await User.findOne({ where: { username: userData.username } });
      if (existingUser) {
        throw new Error('Username already exists');
      }
      
      // Check if email already exists
      if (userData.email) {
        const existingEmail = await User.findOne({ where: { email: userData.email } });
        if (existingEmail) {
          throw new Error('Email already exists');
        }
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user'
      });
      
      // Return user without password
      const { password, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  /**
   * Login a user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} User object and JWT token
   */
  async login(username, password) {
    try {
      // Find user
      const user = await User.findOne({ where: { username } });
      if (!user) {
        throw new Error('Invalid username or password');
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid username or password');
      }
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user.toJSON();
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
  
  /**
   * Generate JWT token for user
   * @private
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  }
  
  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new Error('Invalid token');
    }
  }
}

module.exports = new AuthService();
