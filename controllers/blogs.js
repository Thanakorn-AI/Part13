// Part13/controllers/blogs.js
const router = require('express').Router();
const { Blog } = require('../models');

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll();
  console.log('Blogs retrieved:', blogs.length); // Keep your log
  res.json(blogs);
});

router.post('/', async (req, res) => {
  console.log('Creating blog with data:', req.body); // Keep your log
  const blog = await Blog.create(req.body);
  console.log('Blog created:', blog.id); // Keep your log
  res.json(blog);
});

router.delete('/:id', async (req, res) => {
  console.log('Deleting blog with ID:', req.params.id); // Keep your log
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    await blog.destroy();
    console.log('Blog deleted successfully'); // Keep your log
    res.status(204).end();
  } else {
    console.log('Blog not found'); // Keep your log
    res.status(404).end();
  }
});

module.exports = router;