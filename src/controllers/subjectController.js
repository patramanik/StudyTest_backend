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


module.exports = subjectController;