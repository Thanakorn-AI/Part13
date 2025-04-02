// Part13/index.js
const express = require('express');
const app = express();
const { PORT } = require('./util/config');
const { connectToDatabase } = require('./util/db');
const blogsRouter = require('./controllers/blogs');

// Log environment for debugging (keeping your logs)
console.log('Environment:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

app.use(express.json());
app.use('/api/blogs', blogsRouter);

// Basic health check endpoint (keeping yours)
app.get('/', (req, res) => {
  res.send('Blog app running!');
});

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, '0.0.0.0', () => { // Keep '0.0.0.0' for Fly.io
    console.log(`Server running on port ${PORT}`);
  });
};

start();