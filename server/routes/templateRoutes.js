const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

// GET all templates with review stats
router.get('/', templateController.getAllTemplates);

// Seed templates (one-time)
router.post('/seed', templateController.seedTemplates);

// GET single template
router.get('/:templateId', templateController.getTemplateById);

// POST increment usage
router.post('/:templateId/use', templateController.useTemplate);

module.exports = router;
