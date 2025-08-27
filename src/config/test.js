

// controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, TestAttempt, Test } = require('../models');

const userController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword
      });
      
      res.status(201).json({
        message: 'User created successfully',
        userId: user.id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // User login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user profile with test attempts
  getProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'created_at'],
        include: [
          {
            model: TestAttempt,
            include: [{ model: Test, attributes: ['title'] }],
            order: [['started_at', 'DESC']],
            limit: 10
          }
        ]
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

// controllers/subjectController.js
const { Subject, Quiz, Test } = require('../models');

const subjectController = {
  // Get all subjects with test and quiz count
  getAllSubjects: async (req, res) => {
    try {
      const subjects = await Subject.findAll({
        include: [
          {
            model: Test,
            attributes: [],
            required: false
          },
          {
            model: Quiz,
            attributes: [],
            required: false
          }
        ],
        attributes: [
          'id',
          'name',
          'description',
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Tests.id'))), 'testCount'],
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Quizzes.id'))), 'quizCount']
        ],
        group: ['Subject.id'],
        order: [['name', 'ASC']]
      });
      
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get subject by ID with tests and standalone quizzes
  getSubjectById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const subject = await Subject.findByPk(id, {
        include: [
          {
            model: Test,
            attributes: ['id', 'title', 'description', 'duration_minutes', 'is_active', 'created_at'],
            include: [{ model: User, as: 'creator', attributes: ['name'] }]
          },
          {
            model: Quiz,
            where: { test_id: null }, // Only standalone quizzes
            attributes: ['id', 'title', 'description', 'created_at'],
            include: [{ model: User, as: 'creator', attributes: ['name'] }],
            required: false
          }
        ]
      });
      
      if (!subject) {
        return res.status(404).json({ error: 'Subject not found' });
      }
      
      res.json(subject);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new subject
  createSubject: async (req, res) => {
    try {
      const { name, description } = req.body;
      
      const subject = await Subject.create({ name, description });
      
      res.status(201).json({
        message: 'Subject created successfully',
        subject
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Subject already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Update subject
  updateSubject: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      const [updatedRows] = await Subject.update(
        { name, description },
        { where: { id } }
      );
      
      if (updatedRows === 0) {
        return res.status(404).json({ error: 'Subject not found' });
      }
      
      res.json({ message: 'Subject updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete subject
  deleteSubject: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedRows = await Subject.destroy({ where: { id } });
      
      if (deletedRows === 0) {
        return res.status(404).json({ error: 'Subject not found' });
      }
      
      res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

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

// controllers/questionController.js
const { Question, Option, Quiz } = require('../models');
const { sequelize } = require('../models');

const questionController = {
  // Create question with options
  createQuestion: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { quiz_id, question_text, question_type, options } = req.body;
      
      // Verify quiz exists and user owns it
      const quiz = await Quiz.findByPk(quiz_id);
      if (!quiz) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Quiz not found' });
      }
      
      if (quiz.created_by !== req.user.userId) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Not authorized to add questions to this quiz' });
      }
      
      // Create question
      const question = await Question.create({
        quiz_id,
        question_text,
        question_type
      }, { transaction });
      
      // Create options
      const optionsData = options.map(opt => ({
        question_id: question.id,
        option_text: opt.text,
        is_correct: opt.isCorrect
      }));
      
      await Option.bulkCreate(optionsData, { transaction });
      
      await transaction.commit();
      
      res.status(201).json({
        message: 'Question created successfully',
        questionId: question.id
      });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: error.message });
    }
  },

  // Update question
  updateQuestion: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { question_text, question_type, options } = req.body;
      
      const question = await Question.findByPk(id, {
        include: [{ model: Quiz }]
      });
      
      if (!question) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Question not found' });
      }
      
      if (question.Quiz.created_by !== req.user.userId) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Not authorized to update this question' });
      }
      
      // Update question
      await question.update({
        question_text,
        question_type
      }, { transaction });
      
      // Delete existing options and create new ones
      await Option.destroy({
        where: { question_id: id },
        transaction
      });
      
      const optionsData = options.map(opt => ({
        question_id: id,
        option_text: opt.text,
        is_correct: opt.isCorrect
      }));
      
      await Option.bulkCreate(optionsData, { transaction });
      
      await transaction.commit();
      
      res.json({ message: 'Question updated successfully' });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ error: error.message });
    }
  },

  // Delete question
  deleteQuestion: async (req, res) => {
    try {
      const { id } = req.params;
      
      const question = await Question.findByPk(id, {
        include: [{ model: Quiz }]
      });
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      if (question.Quiz.created_by !== req.user.userId) {
        return res.status(403).json({ error: 'Not authorized to delete this question' });
      }
      
      await question.destroy();
      
      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

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

module.exports = {
  userController,
  subjectController,
  quizController,
  questionController,
  quizAttemptController
};
