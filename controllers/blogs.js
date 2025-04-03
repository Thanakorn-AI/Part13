// Part13/controllers/blogs.js
const router = require('express').Router();
const { Blog, User } = require('../models');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../util/config');
const { Op } = require('sequelize');

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch (err) {
      console.log('Token invalid');
      return res.status(401).json({ error: 'token invalid' });
    }
  } else {
    console.log('Token missing');
    return res.status(401).json({ error: 'token missing' });
  }
  next();
};

router.get('/', async (req, res) => {
  const where = {};
  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${req.query.search}%` } },
      { author: { [Op.iLike]: `%${req.query.search}%` } }
    ];
  }
  const blogs = await Blog.findAll({
    include: { model: User, attributes: ['name'] },
    where,
    order: [['likes', 'DESC']]
  });
  console.log('Blogs retrieved:', blogs.length);
  res.json(blogs);
});

router.post('/', tokenExtractor, async (req, res) => {
  console.log('Creating blog with data:', req.body);
  const user = await User.findByPk(req.decodedToken.id);
  const blog = await Blog.create({ ...req.body, userId: user.id });
  console.log('Blog created:', blog.id);
  res.json(blog);
});

router.delete('/:id', tokenExtractor, async (req, res) => {
  console.log('Deleting blog with ID:', req.params.id);
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    if (blog.userId === req.decodedToken.id) {
      await blog.destroy();
      console.log('Blog deleted successfully');
      res.status(204).end();
    } else {
      console.log('Unauthorized deletion attempt');
      res.status(403).json({ error: 'only the creator can delete this blog' });
    }
  } else {
    console.log('Blog not found');
    res.status(404).end();
  }
});

router.put('/:id', async (req, res) => {
  console.log('Updating blog with ID:', req.params.id, 'with data:', req.body);
  const blog = await Blog.findByPk(req.params.id);
  if (blog) {
    blog.likes = req.body.likes;
    await blog.save();
    console.log('Blog updated successfully');
    res.json(blog);
  } else {
    console.log('Blog not found');
    res.status(404).end();
  }
});

module.exports = router;