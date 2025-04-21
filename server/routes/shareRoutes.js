const express = require('express');
const router = express.Router();
const { 
  createSharedCode, 
  getSharedCode, 
  getUserSharedCodes,
  deleteSharedCode,
  updateExpiration
} = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');

// Public route to get shared code by ID
router.get('/:shareId', getSharedCode);

// Protected routes
router.post('/', protect, createSharedCode);
router.get('/', protect, getUserSharedCodes);
router.delete('/:shareId', protect, deleteSharedCode);
router.patch('/:shareId/expiration', protect, updateExpiration);

module.exports = router;