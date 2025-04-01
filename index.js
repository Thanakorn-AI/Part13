// Part13/index.js
require('dotenv').config()
const express = require('express')
const { Sequelize, Model, DataTypes } = require('sequelize')

const app = express()
app.use(express.json())

// Log environment for debugging
console.log('Environment:', process.env.NODE_ENV)
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)

// Configure database connection with proper error handling
let sequelize
try {
  const dbUrl = process.env.DATABASE_URL
  
  sequelize = new Sequelize(dbUrl, {
    dialectOptions: {
      // Disable SSL validation for Fly.io internal connections
      ssl: false
    },
    logging: console.log // Enable logging for debugging
  })
  
  console.log('Sequelize instance created')
} catch (error) {
  console.error('Error creating Sequelize instance:', error)
}

// Define Blog model
class Blog extends Model {}
Blog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author: {
    type: DataTypes.TEXT
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'blog'
})

// Test database connection at startup
const initDb = async () => {
  try {
    console.log('Testing database connection...')
    await sequelize.authenticate()
    console.log('Database connection successful!')
    
    console.log('Syncing database model...')
    await Blog.sync()
    console.log('Database model synced!')
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

// Initialize the database
initDb()

// Basic health check endpoint
app.get('/', (req, res) => {
  res.send('Blog app running!')
})

// List all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.findAll()
    console.log('Blogs retrieved:', blogs.length)
    res.json(blogs)
  } catch (error) {
    console.error('Error fetching blogs:', error)
    res.status(500).json({ error: error.message })
  }
})

// Add a new blog
app.post('/api/blogs', async (req, res) => {
  try {
    console.log('Creating blog with data:', req.body)
    const blog = await Blog.create(req.body)
    console.log('Blog created:', blog.id)
    return res.json(blog)
  } catch(error) {
    console.error('Error creating blog:', error)
    return res.status(400).json({ error: error.message })
  }
})

// Delete a blog
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    console.log('Deleting blog with ID:', req.params.id)
    const blog = await Blog.findByPk(req.params.id)
    if (blog) {
      await blog.destroy()
      console.log('Blog deleted successfully')
      res.status(204).end()
    } else {
      console.log('Blog not found')
      res.status(404).end()
    }
  } catch (error) {
    console.error('Error deleting blog:', error)
    res.status(500).json({ error: error.message })
  }
})

// Start the server on 0.0.0.0 (important for Fly.io)
const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})