const { Sequelize } = require('sequelize');
const path = require('path');

// Database connection setup
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'sqlite::memory:',
  {
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: process.env.DATABASE_URL ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : undefined
  }
);

// Import models
const User = require('./User')(sequelize, Sequelize.DataTypes);

// Model associations
// (Add associations here as needed)

// Export models and sequelize instance
module.exports = {
  sequelize,
  User
};
