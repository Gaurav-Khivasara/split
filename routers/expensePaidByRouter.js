const express = require('express');
const router = express.Router();

const db = require('../config/db');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'This is expense paid by route' });
});

router.post('/add', async (req, res) => {
  try {
    const { expenseId, userId, amountPaid } = req.body;
    console.log('Request -- Expense & Paid by details:', expenseId + ', ' + userId + ', ' + amountPaid);

    const rowCount = (await db.query(
      `INSERT INTO paid_by (expense_id, user_id, amount_paid)
      SELECT $1, $2, $3 WHERE EXISTS (
        SELECT 1 FROM expenses e
        JOIN group_members gm ON gm.group_id = e.group_id
        WHERE e.id = $1 AND gm.user_id = $2
      ) RETURNING *`,
      [expenseId, userId, amountPaid]
    )).rowCount;

    if (rowCount == 0) {
      const userNotInGroupError = new Error('User is not in the group associated with the expense OR The group does not exist!');
      userNotInGroupError.code = '00000';
      throw userNotInGroupError;
    }

    const expenseDescription = (await db.query(
      `SELECT description FROM expenses WHERE id = $1`,
      [expenseId]
    )).rows[0].description;

    // TODO 1
    // Add to activities table (activities for each user will be different)
    // corresponding to its expense

    res.status(201).json({
      message: 'Expense paid by added successfully!',
      expenseDescription
    });
  } catch (err) {
    console.error('Error adding paid by:', err.message);

    if (err.code === '23505') {
      res.status(409).json({ message: 'User paid already exists for this expense!' });
    } else if (err.code === '00000') {
      res.status(403).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'An error occured!' });
    }
  }
});

router.get('/get-all-by-expense-id/:expenseId', async (req, res) => {
  try {
    const expenseId = req.params.expenseId;
    console.log('Request -- Expense id:', expenseId);

    const { rowCount, rows } = await db.query(
      `SELECT user_id, amount_paid FROM paid_by
      WHERE expense_id = $1 AND EXISTS (
        SELECT 1 FROM expenses
        WHERE id = $1 AND is_deleted = false
      )`,
      [expenseId]
    );

    // console.log(rows[0]);

    if (rowCount == 0) {
      const noExpenseError = new Error('Expense does not exist!');
      noExpenseError = '00000';
      throw noExpenseError;
    }

    res.status(200).json({ rowCount, expenseId, rows });
  } catch (err) {
    console.error('Error fetching paid by:', err.message);

    if (err.code === '00000') {
      res.status(403).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'An error occured!' });
    }
  }
});

module.exports = router;
