// Part13/index.js
const express = require('express');
const app = express();
const { PORT } = require('./util/config');
const { connectToDatabase } = require('./util/db');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const authorsRouter = require('./controllers/authors');

// Log environment for debugging (keeping your logs)
console.log('Environment:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

app.use(express.json());
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/authors', authorsRouter);

// Basic health check endpoint (keeping yours)
app.get('/', (req, res) => {
  res.send('Blog app running!');
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: error.errors.map(e => e.message)
    });
  }
  res.status(500).json({ error: 'Something went wrong' });
});

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, '0.0.0.0', () => { // Keep '0.0.0.0' for Fly.io
    console.log(`Server running on port ${PORT}`);
  });
};

start();