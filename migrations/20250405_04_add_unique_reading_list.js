// Part13/migrations/20250405_04_add_unique_reading_list.js
const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Remove any existing duplicates first
    await queryInterface.sequelize.query(`
      DELETE FROM reading_lists
      WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, blog_id ORDER BY id) AS rnum
          FROM reading_lists
        ) t WHERE t.rnum > 1
      );
    `);
    // Add unique constraint
    await queryInterface.addConstraint('reading_lists', {
      fields: ['user_id', 'blog_id'],
      type: 'unique',
      name: 'reading_lists_user_id_blog_id_unique'
    });
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeConstraint('reading_lists', 'reading_lists_user_id_blog_id_unique');
  }
};