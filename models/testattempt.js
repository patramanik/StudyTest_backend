"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TestAttempt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // TestAttempt associations
      TestAttempt.belongsTo(models.User, { foreignKey: "user_id" });
      TestAttempt.belongsTo(models.Test, { foreignKey: "test_id" });
      TestAttempt.hasMany(models.QuizAttempt, {
        foreignKey: "test_attempt_id",
        onDelete: "CASCADE",
      });
    }
  }
  TestAttempt.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: User,
          key: "id",
        },
      },
      test_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Test,
          key: "id",
        },
      },
      total_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      max_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      time_taken_minutes: {
        type: DataTypes.INTEGER,
      },
      is_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      started_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      completed_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "TestAttempt",
    }
  );
  return TestAttempt;
};
