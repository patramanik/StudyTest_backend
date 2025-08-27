// controllers/quizAttemptController.js
const { QuizAttempt, UserAnswer, Quiz, Question, Option, User } = require('../models');
const { sequelize } = require('../models');

const quizAttemptController = {
  // Submit quiz attempt
  submitQuizAttempt: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { quiz_id, answers } = req.body; // answers: [{question_id, option_id}]
      const user_id = req.user.userId;
      
      // Create quiz attempt
      const attempt = await QuizAttempt.create({
        user_id,
        quiz_id,
        score: 0
      }, { transaction });
      
      let score = 0;
      const userAnswers = [];
      
      // Process each answer
      for (const answer of answers) {
        // Check if the selected option is correct
        const option = await Option.findByPk(answer.option_id);
        if (option && option.is_correct) {
          score++;
        }
        
        userAnswers.push({
          attempt_id: attempt.id,
          question_id: answer.question_id,
          option_id: answer.option_id
        });
      }
      
      // Save user answers
      await UserAnswer.bulkCreate(userAnswers, { transaction });
      
      // Update score
      await attempt.update({ score }, { transaction });
      
      await transaction.commit();
      
      res.status(201).json({
        message: 'Quiz submitted successfully',
        attemptId: attempt.id,
        score,
        totalQuestions: answers.length
      });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: error.message });
    }
  },

  // Get user's quiz attempts
  getUserQuizAttempts: async (req, res) => {
    try {
      const user_id = req.user.userId;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows: attempts } = await QuizAttempt.findAndCountAll({
        where: { user_id },
        include: [
          {
            model: Quiz,
            attributes: ['title', 'description'],
            include: [{ model: Subject, attributes: ['name'] }]
          }
        ],
        order: [['attempted_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        attempts,
        totalCount: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get quiz attempt details
  getQuizAttemptDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.userId;
      
      const attempt = await QuizAttempt.findOne({
        where: { id, user_id },
        include: [
          {
            model: Quiz,
            attributes: ['title', 'description']
          },
          {
            model: UserAnswer,
            include: [
              {
                model: Question,
                attributes: ['question_text']
              },
              {
                model: Option,
                attributes: ['option_text', 'is_correct']
              }
            ]
          }
        ]
      });
      
      if (!attempt) {
        return res.status(404).json({ error: 'Quiz attempt not found' });
      }
      
      res.json(attempt);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get quiz leaderboard
  getQuizLeaderboard: async (req, res) => {
    try {
      const { quiz_id } = req.params;
      const { limit = 10 } = req.query;
      
      const leaderboard = await QuizAttempt.findAll({
        where: { quiz_id },
        include: [
          {
            model: User,
            attributes: ['name']
          }
        ],
        attributes: [
          'score',
          'attempted_at',
          [sequelize.fn('MAX', sequelize.col('score')), 'best_score']
        ],
        group: ['user_id'],
        order: [[sequelize.fn('MAX', sequelize.col('score')), 'DESC']],
        limit: parseInt(limit)
      });
      
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = quizAttemptController;