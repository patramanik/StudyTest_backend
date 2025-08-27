"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Question associations
      Question.belongsTo(models.Quiz, { foreignKey: "quiz_id" });
      Question.belongsTo(models.Test, { foreignKey: "test_id" });
      Question.hasMany(models.Option, {
        foreignKey: "question_id",
        onDelete: "CASCADE",
      });
      Question.hasMany(models.UserAnswer, { foreignKey: "question_id" });
    }
  }
  Question.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Quiz,
          key: "id",
        },
      },
      test_id: {
        type: Sequelize.INTEGER,
        references: {
          model: Test,
          key: "id",
        },
      },
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      question_type: {
        type: Sequelize.ENUM("MCQ", "TRUE_FALSE"),
        defaultValue: "MCQ",
      },
      difficulty: {
        type: Sequelize.ENUM("easy", "medium", "hard"),
        defaultValue: "medium",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      modelName: "Question",
    }
  );
  return Question;
};
