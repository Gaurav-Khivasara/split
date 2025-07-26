const express = require('express');
const router = express.Router();

const db = require('../config/db');

router.get('/', (req, res) => {
  res.json({ message: 'This is expenses route' });
});

router.post('/add', async (req, res) => {
  try {
    const { description, groupId, cost, addedBy } = req.body;
    console.log('Request -- Expense details:', description + ', ' + groupId + ', ' + cost + ', ' + addedBy);

    const { rowCount, rows: [{ id: expenseId }] } = await db.query(
      `INSERT INTO expenses (description, group_id, cost, added_by)
      SELECT $1, $2, $3, $4 WHERE EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON gm.group_id = g.id
        WHERE gm.group_id = $2 AND gm.user_id = $4 AND g.is_deleted = false
      ) RETURNING *`,
      [description, groupId, cost, addedBy]
    );

    if (rowCount == 0) {
      const userNotInGroupError = new Error('User is not in the group associated with the expense OR The group does not exist!');
      userNotInGroupError.code = '00000';
      throw userNotInGroupError;
    }

    // TODO Front-end
    // users({addedBy}).name added expenses({expenseId}).description in groups({groupId}).name -- Delete button
      // Current logged user and the expense relation
      // Date Time
    await db.query(
      `INSERT INTO expense_activities (performed_by, description, expense_id)
      VALUES ($1, 'added', $2)`,
      [addedBy, expenseId]
    );

    res.status(201).json({
      message: 'Expense added successfully!',
    });
  } catch (err) {
    console.error('Error adding expense:', err.message);

    if (err.code === '00000') {
      res.status(403).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'An error occured!' });
    }
  }
});

router.get('/get-all-by-group-id/:groupId', async (req, res) => {
  try {
    const groupId = req.params.groupId;
    console.log('Request -- Group id:', groupId);

    const { rowCount: expenseCount, rows: expenses } = await db.query(
      `SELECT e.id, e.description, e.cost,
      COALESCE(pb.user_id, s.user_id) AS user_id,
      COALESCE(pb.amount_paid, 0.00) AS amount_paid,
      COALESCE(s.share_amount, 0.00) AS share_amount
      FROM expenses e JOIN (
        SELECT expense_id, user_id FROM paid_by
        UNION
        SELECT expense_id, user_id FROM shares
      ) u ON u.expense_id = e.id
      LEFT JOIN paid_by pb ON pb.expense_id = u.expense_id AND pb.user_id = u.user_id
      LEFT JOIN shares s ON s.expense_id = u.expense_id AND s.user_id = u.user_id
      WHERE e.group_id = $1 AND e.is_deleted = false AND EXISTS (
        SELECT 1 FROM groups WHERE id = $1 AND is_deleted = false
      )
      ORDER BY e.id, user_id`,
      [groupId]
    );

    // console.log(expenses[0]);

    if (expenseCount == 0) {
      const groupNotFoundError = new Error('Group does not exist OR No expenses in the group!');
      groupNotFoundError.code = '00000';
      throw groupNotFoundError;
    }

    const totExpenses = (await db.query(
      `SELECT id FROM expenses e
      WHERE e.group_id = $1 AND e.is_deleted = false AND EXISTS(
        SELECT 1 FROM groups WHERE id = $1 AND is_deleted = false
      )`,
      [groupId]
    )).rowCount;
    
    // 2. Also wherever in other files there are multiple DB qeurying in same request try to minimize

    res.status(200).json({ totExpenses, expenseCount, expenses});
  } catch (err) {
    console.error('Error fetching all expenses:', err.message);

    if (err.code === '00000') {
      res.status(403).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'An error occured!' });
    }
  }
});

router.get('/get-all-by-user-id/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Request -- User id:', userId);

    // TODO NOW IF
    // This is found required while developing other required routes from Splitwise
    const { rowCount: expenseCount, rows: expenses } = await db.query(
      `SELECT e.*,
      COALESCE(pb.amount_paid, 0) AS amount_paid,
      COALESCE(s.share_amount, 0) AS share_amount
      FROM expenses e
      LEFT JOIN paid_by pb ON e.id = pb.expense_id AND pb.user_id = $1
      LEFT JOIN shares s ON e.id = s.expense_id AND s.user_id = $1
      WHERE e.is_deleted = false AND (pb.amount_paid IS NOT NULL OR s.share_amount IS NOT NULL) AND EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.user_id = $1 AND g.is_deleted = false AND e.group_id = g.id
      )`,
      // `SELECT e.*,
      // COALESCE(pb.amount_paid, 0) AS amount_paid,
      // COALESCE(s.share_amount, 0) AS share_amount
      // FROM expenses e
      // JOIN groups g ON e.group_id = g.id
      // JOIN group_members gm ON gm.group_id = g.id
      // LEFT JOIN paid_by pb ON e.id = pb.expense_id AND pb.user_id = $1
      // LEFT JOIN shares s ON e.id = s.expense_id AND s.user_id = $1
      // WHERE e.is_deleted = false AND g.is_deleted = false AND (pb.amount_paid IS NOT NULL OR s.share_amount IS NOT NULL) AND gm.user_id = $1`,
      [userId]
    );

    // console.log(expenses[0]);

    if (expenseCount == 0) {
      const noExpenseForUserError = new Error('No expenses for this user!');
      noExpenseForUserError.code = '00000';
      throw noExpenseForUserError;
    }

    res.status(200).json({ expenseCount, expenses});
  } catch (err) {
    console.error('Error fetching all expenses:', err.message);

    if (err.code === '00000') {
      res.status(403).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'An error occured!' });
    }
  }
});

module.exports = router;
