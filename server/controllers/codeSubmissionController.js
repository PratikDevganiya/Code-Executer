const asyncHandler = require('express-async-handler');
const CodeSubmission = require('../models/CodeSubmission');

/**
 * Save a code submission
 * @route POST /api/submissions
 * @access Private
 */
const saveSubmission = asyncHandler(async (req, res) => {
  const { code, language, input, output, status, executionTime } = req.body;

  if (!code || !language) {
    res.status(400);
    throw new Error('Please provide code and language');
  }

  // Get user ID from auth middleware
  const userId = req.user._id;

  // Create new submission
  const submission = await CodeSubmission.create({
    user: userId,
    code,
    language,
    input: input || '',
    output: output || '',
    status: status || 'completed',
    executionTime: executionTime || 0
  });

  // Check if user has more than 50 submissions
  const count = await CodeSubmission.countDocuments({ user: userId });
  
  // If more than 50, delete the oldest ones
  if (count > 50) {
    const submissionsToDelete = count - 50;
    const oldestSubmissions = await CodeSubmission.find({ user: userId })
      .sort({ createdAt: 1 })
      .limit(submissionsToDelete);
    
    if (oldestSubmissions.length > 0) {
      await CodeSubmission.deleteMany({ 
        _id: { $in: oldestSubmissions.map(s => s._id) } 
      });
    }
  }

  res.status(201).json(submission);
});

/**
 * Get user's code submissions with filtering
 * @route GET /api/submissions
 * @access Private
 */
const getSubmissions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Parse query parameters for filtering
  const { language, status, startDate, endDate, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = { user: userId };
  
  if (language) {
    filter.language = language;
  }
  
  if (status) {
    filter.status = status;
  }
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get submissions with pagination
  const submissions = await CodeSubmission.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await CodeSubmission.countDocuments(filter);
  
  res.json({
    submissions,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Get a single submission by ID
 * @route GET /api/submissions/:id
 * @access Private
 */
const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await CodeSubmission.findById(req.params.id);
  
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }
  
  // Check if the submission belongs to the user
  if (submission.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this submission');
  }
  
  res.json(submission);
});

/**
 * Delete a submission
 * @route DELETE /api/submissions/:id
 * @access Private
 */
const deleteSubmission = asyncHandler(async (req, res) => {
  const submission = await CodeSubmission.findById(req.params.id);
  
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }
  
  // Check if the submission belongs to the user
  if (submission.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this submission');
  }
  
  await submission.deleteOne();
  
  res.json({ message: 'Submission removed' });
});

/**
 * Update a submission
 * @route PUT /api/submissions/:id
 * @access Private
 */
const updateSubmission = asyncHandler(async (req, res) => {
  const { code, language, input, output, status, executionTime } = req.body;

  if (!code || !language) {
    res.status(400);
    throw new Error('Please provide code and language');
  }

  const submission = await CodeSubmission.findById(req.params.id);
  
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }
  
  // Check if the submission belongs to the user
  if (submission.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this submission');
  }

  // Update submission
  submission.code = code;
  submission.language = language;
  submission.input = input || '';
  submission.output = output || '';
  submission.status = status || 'completed';
  submission.executionTime = executionTime || 0;
  
  const updatedSubmission = await submission.save();
  
  res.json(updatedSubmission);
});

module.exports = {
  saveSubmission,
  getSubmissions,
  getSubmissionById,
  deleteSubmission,
  updateSubmission
}; 