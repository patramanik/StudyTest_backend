"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Quiz associations
      Quiz.belongsTo(models.User, { foreignKey: "created_by", as: "creator" });
      Quiz.belongsTo(models.Subject, { foreignKey: "subject_id" });
      Quiz.belongsTo(models.Test, { foreignKey: "test_id" });
      Quiz.hasMany(models.Question, {
        foreignKey: "quiz_id",
        onDelete: "CASCADE",
      });
      Quiz.hasMany(models.QuizAttempt, { foreignKey: "quiz_id" });
    }
  }
  Quiz.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      test_id: {
        type: DataTypes.INTEGER,
        references: {
          model: Test,
          key: "id",
        },
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Subject,
          key: "id",
        },
      },
      created_by: {
        type: DataTypes.INTEGER,
        references: {
          model: User,
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    },
    {
      sequelize,
      modelName: "Quiz",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Quiz;
};
