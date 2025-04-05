// Part13/controllers/users.js
const router = require('express').Router();
const { User, Blog } = require('../models');

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: { model: Blog, attributes: ['title', 'url', 'likes'] }
  });
  console.log('Users retrieved:', users.length);
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const where = {};
  if (req.query.read === 'true') where.read = true;
  if (req.query.read === 'false') where.read = false;

  const user = await User.findByPk(req.params.id, {
    include: {
      model: Blog,
      as: 'reading_blogs',
      attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
      through: { attributes: ['read', 'id'], where }
    }
  });
  if (user) {
    const readings = user.reading_blogs.map(blog => ({
      id: blog.id,
      url: blog.url,
      title: blog.title,
      author: blog.author,
      likes: blog.likes,
      year: blog.year,
      readinglists: [{ read: blog.reading_list.read, id: blog.reading_list.id }]
    }));
    res.json({
      name: user.name,
      username: user.username,
      readings
    });
  } else {
    res.status(404).end();
  }
});

router.post('/', async (req, res) => {
  console.log('Creating user with data:', req.body);
  const user = await User.create(req.body);
  console.log('User created:', user.id);
  res.json(user);
});

router.put('/:username', async (req, res) => {
  console.log('Updating user with username:', req.params.username, 'with data:', req.body);
  const user = await User.findOne({ where: { username: req.params.username } });
  if (user) {
    user.username = req.body.username;
    await user.save();
    console.log('User updated successfully');
    res.json(user);
  } else {
    console.log('User not found');
    res.status(404).end();
  }
});

module.exports = router;