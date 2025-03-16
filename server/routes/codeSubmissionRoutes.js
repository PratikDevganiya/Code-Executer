const express = require('express');
const router = express.Router();
const { 
  saveSubmission, 
  getSubmissions, 
  getSubmissionById, 
  deleteSubmission,
  updateSubmission
} = require('../controllers/codeSubmissionController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected - require authentication
router.use(protect);

// Routes
router.route('/')
  .post(saveSubmission)
  .get(getSubmissions);

router.route('/:id')
  .get(getSubmissionById)
  .delete(deleteSubmission)
  .put(updateSubmission);

module.exports = router; 