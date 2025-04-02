// Part13/models/index.js
const Blog = require('./blog');

Blog.sync();

module.exports = { Blog };