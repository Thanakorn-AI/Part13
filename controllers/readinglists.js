// Part13/controllers/readinglists.js
const router = require('express').Router();
const { ReadingList, User } = require('../models');
const { tokenExtractor } = require('../util/middleware');

router.post('/', async (req, res) => {
  console.log('Adding to reading list:', req.body);
  try {
    const readingListEntry = await ReadingList.create({
      userId: req.body.userId,
      blogId: req.body.blogId
    });
    console.log('Reading list entry created:', readingListEntry.id);
    res.json(readingListEntry);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Blog already in reading list' });
    }
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.put('/:id', tokenExtractor, async (req, res) => {
  console.log('Updating reading list entry ID:', req.params.id);
  const readingListEntry = await ReadingList.findByPk(req.params.id);
  if (readingListEntry) {
    if (readingListEntry.userId === req.decodedToken.id) {
      readingListEntry.read = req.body.read;
      await readingListEntry.save();
      console.log('Reading list entry updated');
      res.json(readingListEntry);
    } else {
      console.log('Unauthorized update attempt');
      res.status(403).json({ error: 'only the user can update their reading list' });
    }
  } else {
    console.log('Reading list entry not found');
    res.status(404).end();
  }
});

module.exports = router;