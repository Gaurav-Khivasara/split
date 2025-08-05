const express = require("express");
const router = express.Router();

router.get("", (req, res) => {
  res.json({ message: "Hello World!" });
});

const userRouter = require("./userRouter");
router.use("/users", userRouter);

const expenseRouter = require("./expenseRouter");
router.use("/expenses", expenseRouter);

const groupRouter = require("./groupRouter");
router.use("/groups", groupRouter);

const groupMemberRouter = require("./groupMemberRouter");
router.use("/group-members", groupMemberRouter);

const expensePaidByRouter = require("./expensePaidByRouter");
router.use("/expense-paid-by", expensePaidByRouter);

const expenseShareRouter = require("./expenseShareRouter");
router.use("/expense-shares", expenseShareRouter);

const friendRouter = require("./friendRouter");
router.use("/friends", friendRouter);

module.exports = router;
