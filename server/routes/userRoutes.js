const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validate = require('../middlewares/validate');
const schemas = require('../validators/schemas');

// Sync user data from Clerk (Create/Update)
router.post('/sync',validate(schemas.syncUserSchema), userController.syncUser);

// Update user profile (Business Name, Photo)
router.post('/profile',validate(schemas.updateProfileSchema), userController.updateUserProfile);

module.exports = router;
