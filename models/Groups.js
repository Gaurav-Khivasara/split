const { defaultValueSchemable } = require("sequelize/lib/utils");

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define("Expense", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      default: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      default: DataTypes.NOW
    }
  });
};
