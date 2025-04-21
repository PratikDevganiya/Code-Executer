const express = require('express');
const router = express.Router();
const { 
  getUserFiles, 
  getFileTree, 
  getFileById, 
  createFile, 
  updateFile, 
  deleteFile,
  moveFile 
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected - require authentication
router.use(protect);

// Get files with optional parent directory filter
router.get('/', getUserFiles);

// Get hierarchical file tree
router.get('/tree', getFileTree);

// Get a specific file by ID
router.get('/:id', getFileById);

// Create a new file or folder
router.post('/', createFile);

// Update a file's content or name
router.put('/:id', updateFile);

// Delete a file
router.delete('/:id', deleteFile);

// Move a file to a new location
router.put('/:id/move', moveFile);

module.exports = router; 