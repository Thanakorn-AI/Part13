// Part13/controllers/login.js
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const { User } = require('../models');
const { SECRET } = require('../util/config');

router.post('/', async (req, res) => {
  console.log('Login attempt with data:', req.body);
  const user = await User.findOne({ where: { username: req.body.username } });
  const passwordCorrect = req.body.password === 'secret';
  if (!(user && passwordCorrect)) {
    console.log('Invalid username or password');
    return res.status(401).json({ error: 'invalid username or password' });
  }
  const userForToken = { username: user.username, id: user.id };
  const token = jwt.sign(userForToken, SECRET);
  console.log('Login successful, token issued');
  res.status(200).send({ token, username: user.username, name: user.name });
});

module.exports = router;