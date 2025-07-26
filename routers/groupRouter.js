const express = require('express');
const router = express.Router();

const db = require('../config/db');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'This is groups route' });
});

router.post('/add', async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    console.log('Request -- Group details:', name + ', ' + createdBy);
  
    const groupId = (await db.query(
      `INSERT INTO groups (name, created_by)
      VALUES ($1, $2) RETURNING *`,
      [name, createdBy]
    )).rows[0].id;

    // const addGroupMember = await db.query(
    await db.query(
      `INSERT INTO group_members (group_id, user_id)
      VALUES ($1, $2)`,
      // VALUES ($1, $2) RETURNING *`,
      [groupId, createdBy]
    );

    // TODO Front-end
    // users({createdBy}).name created group groups({groupId}).name -- Delete group button
      // Date Time
    await db.query(
      `INSERT INTO group_activities (performed_by, description, performed_on_user, group_id)
      VALUES ($1, 'created', $1, $2)`,
      [createdBy, groupId]
    );

    res.status(201).json({
      message: 'Group created successfully!',
      name
    });
  } catch(err) {
    console.error('Error creating group:', err.message);

    res.status(500).json({ message: 'An error occured!' });
  }
});

router.get('/get-all-by-user-id/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Request -- User id:', userId);

    const { rowCount: groupCount, rows: groups } = await db.query(
      `SELECT * FROM groups
      WHERE is_deleted = false AND EXISTS (
        SELECT 1 FROM group_members WHERE group_id = groups.id AND user_id = $1
      )`,
      [userId]
    );

    // console.log(groups[0]);

    if (groupCount == 0) {
      const noGroupsError = new Error('User does not exist OR Is not in any group!');
      noGroupsError.code = '00000';
      throw noGroupsError;
    }

    res.status(200).json({ groupCount, groups });
  } catch (err) {
    console.error('Error fetching all groups:', err.message);

    if (err.code === '00000') {
      res.status(403).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'An error occured!' });
    }
  }
});

module.exports = router;
