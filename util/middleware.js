// Part13/util/middleware.js
const jwt = require('jsonwebtoken');
const { SECRET } = require('./config');
const { Session, User } = require('../models');

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7);
      const decodedToken = jwt.verify(token, SECRET);
      const session = await Session.findOne({ where: { token } });
      if (!session) {
        return res.status(401).json({ error: 'session expired or invalid' });
      }
      const user = await User.findByPk(decodedToken.id);
      if (user.disabled) {
        return res.status(401).json({ error: 'account disabled' });
      }
      req.decodedToken = decodedToken;
    } catch {
      return res.status(401).json({ error: 'token invalid' });
    }
  } else {
    return res.status(401).json({ error: 'token missing' });
  }
  next();
};

module.exports = { tokenExtractor };