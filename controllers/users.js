// Part13/controllers/users.js
const router = require('express').Router();
const { User } = require('../models');

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: { model: Blog, attributes: ['title', 'url', 'likes'] }
  });
  console.log('Users retrieved:', users.length);
  res.json(users);
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