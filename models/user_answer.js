"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User_Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User_Answer associations
      User_Answer.belongsTo(models.QuizAttempt, {
        foreignKey: "attempt_id",
        onDelete: "CASCADE",
      });
      User_Answer.belongsTo(models.Question, { foreignKey: "question_id" });
      User_Answer.belongsTo(models.Option, { foreignKey: "option_id" });
    }
  }
  User_Answer.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      attempt_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: TestAttempt,
          key: "id",
        },
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Question,
          key: "id",
        },
      },
      option_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Option,
          key: "id",
        },
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
      modelName: "User_Answer",
    }
  );
  return User_Answer;
};
