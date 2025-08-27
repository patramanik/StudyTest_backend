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