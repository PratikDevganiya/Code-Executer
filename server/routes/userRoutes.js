const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  registerUser, 
  loginUser, 
  getUserProfile 
} = require('../controllers/userController');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working' });
});

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

module.exports = router;