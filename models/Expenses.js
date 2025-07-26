const { defaultValueSchemable } = require("sequelize/lib/utils");

module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define("Expense", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Groups',
        key: 'id'
      }
    },
    paid_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    shares_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    added_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  });
};
