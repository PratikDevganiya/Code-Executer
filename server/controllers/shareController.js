const asyncHandler = require('express-async-handler');
const SharedCode = require('../models/SharedCode');
const { formatLanguageName } = require('../utils/languageUtils');

/**
 * Create a new shared code entry
 * @route POST /api/share
 * @access Private
 */
const createSharedCode = asyncHandler(async (req, res) => {
  const { code, language, input, output, shareId, expirationPeriod } = req.body;

  if (!code || !language || !shareId) {
    res.status(400);
    throw new Error('Please provide code, language, and shareId');
  }

  try {
    // Create shared code with optional expiration period
    const sharedCode = await SharedCode.create({
      user: req.user._id,
      code,
      language: formatLanguageName(language),
      input: input || '',
      output: output || '',
      shareId,
      expirationPeriod: expirationPeriod || '24h' // Use provided value or default to 24 hours
    });

    res.status(201).json({
      success: true,
      shareId: sharedCode.shareId,
      expiresAt: sharedCode.expiresAt,
      expirationPeriod: sharedCode.expirationPeriod
    });
  } catch (error) {
    res.status(500);
    if (error.code === 11000) { // Duplicate key error
      throw new Error('Share ID already exists, please try again');
    }
    throw new Error('Failed to create shared code: ' + error.message);
  }
});

/**
 * Get shared code by ID
 * @route GET /api/share/:shareId
 * @access Public
 */
const getSharedCode = asyncHandler(async (req, res) => {
  const { shareId } = req.params;

  if (!shareId) {
    res.status(400);
    throw new Error('Share ID is required');
  }

  // Find shared code
  const sharedCode = await SharedCode.findOneAndUpdate(
    { shareId },
    { $inc: { views: 1 } }, // Increment views
    { new: true }
  );

  if (!sharedCode) {
    res.status(404);
    throw new Error('Shared code not found or has expired');
  }

  const remainingTime = sharedCode.getRemainingTime();

  res.status(200).json({
    code: sharedCode.code,
    language: sharedCode.language,
    input: sharedCode.input,
    output: sharedCode.output,
    views: sharedCode.views,
    createdAt: sharedCode.createdAt,
    expiresAt: sharedCode.expiresAt,
    expirationPeriod: sharedCode.expirationPeriod,
    remainingTime
  });
});

/**
 * Update shared code expiration
 * @route PATCH /api/share/:shareId/expiration
 * @access Private
 */
const updateExpiration = asyncHandler(async (req, res) => {
  const { shareId } = req.params;
  const { expirationPeriod } = req.body;
  
  if (!expirationPeriod) {
    res.status(400);
    throw new Error('Expiration period is required');
  }
  
  // Find the shared code
  const sharedCode = await SharedCode.findOne({ shareId });
  
  if (!sharedCode) {
    res.status(404);
    throw new Error('Shared code not found');
  }
  
  // Verify ownership
  if (sharedCode.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this shared code');
  }
  
  // Update expiration period
  sharedCode.expirationPeriod = expirationPeriod;
  await sharedCode.save();
  
  res.status(200).json({
    success: true,
    expiresAt: sharedCode.expiresAt,
    expirationPeriod: sharedCode.expirationPeriod,
    remainingTime: sharedCode.getRemainingTime()
  });
});

/**
 * Get user's shared codes
 * @route GET /api/share
 * @access Private
 */
const getUserSharedCodes = asyncHandler(async (req, res) => {
  // Find all shared codes for the current user
  const sharedCodes = await SharedCode.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  // Add remaining time to each shared code
  const formattedSharedCodes = sharedCodes.map(code => ({
    _id: code._id,
    shareId: code.shareId,
    language: code.language,
    views: code.views,
    createdAt: code.createdAt,
    expiresAt: code.expiresAt,
    expirationPeriod: code.expirationPeriod,
    remainingTime: code.getRemainingTime()
  }));

  res.status(200).json(formattedSharedCodes);
});

/**
 * Delete shared code
 * @route DELETE /api/share/:shareId
 * @access Private
 */
const deleteSharedCode = asyncHandler(async (req, res) => {
  const { shareId } = req.params;

  // Find shared code
  const sharedCode = await SharedCode.findOne({ shareId });

  if (!sharedCode) {
    res.status(404);
    throw new Error('Shared code not found');
  }

  // Verify ownership
  if (sharedCode.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this shared code');
  }

  // Delete shared code
  await sharedCode.deleteOne();

  res.status(200).json({ success: true, message: 'Shared code deleted' });
});

module.exports = {
  createSharedCode,
  getSharedCode,
  getUserSharedCodes,
  deleteSharedCode,
  updateExpiration
};