// controllers/quizController.js
const { Quiz, Subject, User, Question, Option, QuizAttempt } = require('../models');

const quizController = {
  // Get all quizzes with pagination
  getAllQuizzes: async (req, res) => {
    try {
      const { page = 1, limit = 10, subject_id } = req.query;
      const offset = (page - 1) * limit;
      
      const where = subject_id ? { subject_id } : {};
      
      const { count, rows: quizzes } = await Quiz.findAndCountAll({
        where,
        include: [
          { model: Subject, attributes: ['name'] },
          { model: User, as: 'creator', attributes: ['name'] }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        quizzes,
        totalCount: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get quiz by ID with questions and options
  getQuizById: async (req, res) => {
    try {
      const { id } = req.params;
      const { includeAnswers = false } = req.query;
      
      const quiz = await Quiz.findByPk(id, {
        include: [
          { model: Subject, attributes: ['name'] },
          { model: User, as: 'creator', attributes: ['name'] },
          {
            model: Question,
            include: [
              {
                model: Option,
                attributes: includeAnswers === 'true' 
                  ? ['id', 'option_text', 'is_correct']
                  : ['id', 'option_text']
              }
            ]
          }
        ]
      });
      
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new quiz
  createQuiz: async (req, res) => {
    try {
      const { title, description, subject_id } = req.body;
      const created_by = req.user.userId;
      
      const quiz = await Quiz.create({
        title,
        description,
        subject_id,
        created_by
      });
      
      res.status(201).json({
        message: 'Quiz created successfully',
        quiz
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update quiz
  updateQuiz: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, subject_id } = req.body;
      const userId = req.user.userId;
      
      const quiz = await Quiz.findByPk(id);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      
      if (quiz.created_by !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this quiz' });
      }
      
      await quiz.update({ title, description, subject_id });
      
      res.json({ message: 'Quiz updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete quiz
  deleteQuiz: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const quiz = await Quiz.findByPk(id);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      
      if (quiz.created_by !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this quiz' });
      }
      
      await quiz.destroy();
      
      res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = quizController;