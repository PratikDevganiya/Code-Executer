const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Middleware for handling file uploads
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile
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

// 🔹 Update profile with image & social links
router.put('/update', protect, upload.single('profileImage'), updateUserProfile);

module.exports = router;
