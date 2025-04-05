const request = require('supertest');
const app = require('../src/server');
const { User } = require('../src/models');
const bcrypt = require('bcrypt');

describe('Authentication API', () => {
  // Test user data
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  };
  
  // Clean up test data before tests
  beforeAll(async () => {
    await User.destroy({ where: { username: testUser.username } });
  });
  
  // Clean up test data after tests
  afterAll(async () => {
    await User.destroy({ where: { username: testUser.username } });
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('username', testUser.username);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should not register a user with existing username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Username already exists');
    });
    
    it('should validate registration data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'te',
          email: 'invalid-email',
          password: '123'
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', testUser.username);
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should not login a user with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid username or password');
    });
    
    it('should validate login data', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: '',
          password: ''
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/auth/me', () => {
    let token;
    
    beforeAll(async () => {
      // Login to get token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      
      token = response.body.token;
    });
    
    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', testUser.username);
    });
    
    it('should not get current user with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(response.status).toBe(401);
    });
    
    it('should not get current user without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');
      
      expect(response.status).toBe(401);
    });
  });
});
