const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Sync user data from Clerk (Create/Update)
router.post('/sync', userController.syncUser);

// Update user profile (Business Name, Photo)
router.post('/profile', userController.updateUserProfile);

module.exports = router;
