// Part13/controllers/logout.js
const router = require('express').Router();
const { Session } = require('../models');
const { tokenExtractor } = require('../util/middleware');

router.delete('/', tokenExtractor, async (req, res) => {
  console.log('Logging out user:', req.decodedToken.id);
  await Session.destroy({ where: { userId: req.decodedToken.id } });
  console.log('Sessions deleted');
  res.status(204).end();
});

module.exports = router;