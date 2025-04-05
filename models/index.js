// Part13/models/index.js
const Blog = require('./blog');
const User = require('./user');
const ReadingList = require('./reading_list');
const Session = require('./session');

User.hasMany(Blog);
Blog.belongsTo(User);

User.belongsToMany(Blog, { through: ReadingList, as: 'reading_blogs' });
Blog.belongsToMany(User, { through: ReadingList, as: 'users_reading' });

User.hasMany(Session);
Session.belongsTo(User);

module.exports = { Blog, User, ReadingList, Session };