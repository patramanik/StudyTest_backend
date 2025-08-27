"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Test extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Test associations
      Test.belongsTo(models.User, { foreignKey: "created_by", as: "creator" });
      Test.belongsTo(models.Subject, { foreignKey: "subject_id" });
      Test.hasMany(models.Quiz, { foreignKey: "test_id", onDelete: "CASCADE" });
      Test.hasMany(models.TestAttempt, { foreignKey: "test_id" });
    }
  }
  Test.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      subject_id: {
        type: Sequelize.INTEGER,
        references: {
          model: Subjects,
          key: "id",
        },
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 60,
      },
      max_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      start_time: {
        type: DataTypes.DATE,
      },
      end_time: {
        type: DataTypes.DATE,
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: User,
          key: "id",
        },
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
      modelName: "Test",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Test;
};
