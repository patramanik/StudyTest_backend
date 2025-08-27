'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TestAttempts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        test_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Tests',
            key: 'id'
          }
        },
        total_score: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        max_score: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        time_taken_minutes: {
          type: Sequelize.INTEGER
        },
        is_completed: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        started_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        completed_at: {
          type: Sequelize.DATE
        }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TestAttempts');
  }
};