const { defaultValueSchemable } = require("sequelize/lib/utils");

module.exports = (sequelize, DataTypes) => {
  const GroupMember = sequelize.define("GroupMember", {
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Groups",
        key: "id"
      }
    }
  });
};
