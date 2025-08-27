'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('User_Test_Attempts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      test_attempt_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'TestAttempts',
            key: 'id'
          }
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        quiz_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Quizzes',
            key: 'id'
          }
        },
        score: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('User_Test_Attempts');
  }
};