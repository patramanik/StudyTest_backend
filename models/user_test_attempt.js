"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User_Test_Attempt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
  // User_Test_Attempt associations
  User_Test_Attempt.belongsTo(models.TestAttempt, { foreignKey: 'test_attempt_id' });
  User_Test_Attempt.belongsTo(models.User, { foreignKey: 'user_id' });
  User_Test_Attempt.belongsTo(models.Quiz, { foreignKey: 'quiz_id' });
    }
  }
  User_Test_Attempt.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      test_attempt_id: {
        type: DataTypes.INTEGER,
        references: {
          model: TestAttempt,
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: User,
          key: "id",
        },
      },
      quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Quiz,
          key: "id",
        },
      },
      score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      sequelize,
      modelName: "User_Test_Attempt",
    }
  );
  return User_Test_Attempt;
};
