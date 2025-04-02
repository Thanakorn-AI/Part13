// Part13/util/db.js
const Sequelize = require('sequelize');
const { DATABASE_URL } = require('./config');

const sequelize = new Sequelize(DATABASE_URL, {
  dialectOptions: {
    ssl: false // Match your current setup for Fly.io
  },
  logging: console.log // Keep your debugging logs
});

const connectToDatabase = async () => {
  try {
    console.log('Testing database connection...'); // Match your style
    await sequelize.authenticate();
    console.log('Database connection successful!');
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    return process.exit(1);
  }
  return null;
};

module.exports = { connectToDatabase, sequelize };