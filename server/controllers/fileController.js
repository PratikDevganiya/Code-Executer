const File = require('../models/File');
const CodeSubmission = require('../models/CodeSubmission');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const path = require('path');

// @desc    Get all files for a user (with optional parent directory)
// @route   GET /api/files
// @access  Private
const getUserFiles = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { parentId = null } = req.query;
    
    // Set up filter conditions
    const filterConditions = { 
      user: userId,
      isDeleted: false
    };
    
    // Add parent directory filter if provided
    if (parentId === 'null' || parentId === '') {
      filterConditions.parentId = null; // Root-level files
    } else if (parentId) {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: 'Invalid parent directory ID' });
      }
      filterConditions.parentId = parentId;
    }

    // Find files and sort them (folders first, then files alphabetically)
    const files = await File.find(filterConditions)
      .sort({ type: -1, name: 1 }) // Folders first, then alphabetical
      .lean();
    
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Failed to fetch files', error: error.message });
  }
});

// @desc    Get file tree for a user (recursive structure)
// @route   GET /api/files/tree
// @access  Private
const getFileTree = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all user's files that aren't deleted
    const allFiles = await File.find({ 
      user: userId,
      isDeleted: false
    }).lean();
    
    // Build a map of parent IDs to children
    const fileMap = {};
    allFiles.forEach(file => {
      const parentId = file.parentId ? file.parentId.toString() : 'root';
      if (!fileMap[parentId]) {
        fileMap[parentId] = [];
      }
      fileMap[parentId].push(file);
    });
    
    // Function to build tree recursively
    const buildTree = (parentId = 'root') => {
      const children = fileMap[parentId] || [];
      return children.map(file => ({
        ...file,
        id: file._id.toString(), // Add id field for frontend compatibility
        children: fileMap[file._id.toString()] ? buildTree(file._id.toString()) : []
      }))
      .sort((a, b) => {
        // Sort folders first, then alphabetically
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
    };
    
    const fileTree = buildTree();
    res.status(200).json(fileTree);
  } catch (error) {
    console.error('Error fetching file tree:', error);
    res.status(500).json({ message: 'Failed to fetch file tree', error: error.message });
  }
});

// @desc    Get a single file by ID
// @route   GET /api/files/:id
// @access  Private
const getFileById = asyncHandler(async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user._id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }
    
    // Find the file
    const file = await File.findOne({ 
      _id: fileId,
      user: userId,
      isDeleted: false
    }).lean();
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.status(200).json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Failed to fetch file', error: error.message });
  }
});

// @desc    Create a new file or folder
// @route   POST /api/files
// @access  Private
const createFile = asyncHandler(async (req, res) => {
  try {
    console.log('Create file request body:', req.body);
    
    // Extract data from request and ensure values are set
    const { name, type } = req.body;
    const parentId = req.body.parentId || null;
    const content = req.body.content || '';
    const userId = req.user._id;
    
    console.log('User information:', userId);
    
    // Validate input
    if (!name || !type) {
      console.log('Validation failed: Missing name or type');
      return res.status(400).json({ message: 'Name and type are required' });
    }
    
    if (type !== 'file' && type !== 'folder') {
      console.log('Validation failed: Invalid type', type);
      return res.status(400).json({ message: 'Type must be either "file" or "folder"' });
    }
    
    // If parentId is provided, verify it exists and belongs to the user
    let parentPath = '/';
    if (parentId) {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        console.log('Validation failed: Invalid parent directory ID', parentId);
        return res.status(400).json({ message: 'Invalid parent directory ID' });
      }
      
      const parentFolder = await File.findOne({ 
        _id: parentId,
        user: userId,
        type: 'folder',
        isDeleted: false
      });
      
      if (!parentFolder) {
        console.log('Parent folder not found:', parentId);
        return res.status(404).json({ message: 'Parent folder not found' });
      }
      
      parentPath = parentFolder.path === '/' 
        ? `/${parentFolder.name}` 
        : `${parentFolder.path}/${parentFolder.name}`;
    }
    
    // Check if a file/folder with the same name already exists in this location
    const existingFile = await File.findOne({
      name,
      parentId: parentId || null,
      user: userId,
      isDeleted: false
    });
    
    if (existingFile) {
      console.log('File/folder with same name already exists:', name);
      return res.status(400).json({ 
        message: `A ${existingFile.type} with this name already exists in this location` 
      });
    }
    
    // Prepare file data
    const fileData = {
      name,
      type,
      user: userId,
      parentId,
      path: parentPath
    };
    
    // Add content for files
    if (type === 'file') {
      fileData.content = content;
    }
    
    console.log('Creating new file/folder with:', {
      ...fileData,
      content: type === 'file' ? 'content provided' : undefined
    });
    
    // Create the file directly with the fileData
    const newFile = await File.create(fileData);
    
    // If it's a file, create a submission record
    if (type === 'file') {
      const extension = name.split('.').pop().toLowerCase();
      const extensionMap = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'java': 'java',
        'c': 'c',
        'cpp': 'c++',
        'cs': 'c#',
        'php': 'php',
        'go': 'go',
        'rs': 'rust',
        'rb': 'ruby'
      };
      
      const language = extensionMap[extension] || 'javascript';
      
      await CodeSubmission.create({
        user: userId,
        code: content,
        language: language,
        fileName: name,
        fileId: newFile._id,
        status: 'completed'
      });
    }
    
    console.log('File created successfully:', newFile._id);
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error creating file (detailed):', error);
    res.status(500).json({ message: 'Failed to create file', error: error.message });
  }
});

// @desc    Update a file
// @route   PUT /api/files/:id
// @access  Private
const updateFile = asyncHandler(async (req, res) => {
  try {
    const fileId = req.params.id;
    const { name, content } = req.body;
    const userId = req.user._id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }
    
    // Find the file
    const file = await File.findOne({ 
      _id: fileId,
      user: userId,
      isDeleted: false
    });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Update the file
    if (name) file.name = name;
    if (content !== undefined && file.type === 'file') file.content = content;
    
    // Update file language based on extension if name changes
    if (name && file.type === 'file') {
      const extension = name.split('.').pop().toLowerCase();
      const extensionMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'py': 'python',
        'java': 'java',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'c': 'c',
        'cpp': 'c++',
        'cs': 'c#',
        'php': 'php',
        'go': 'go',
        'rs': 'rust',
        'rb': 'ruby'
      };
      
      file.language = extensionMap[extension] || 'plaintext';
    }
    
    await file.save();
    
    res.status(200).json(file);
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ message: 'Failed to update file', error: error.message });
  }
});

// @desc    Delete a file or folder (hard delete)
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = asyncHandler(async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user._id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }
    
    // Find the file
    const file = await File.findOne({ 
      _id: fileId,
      user: userId
    });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // If it's a folder, delete all contained files/folders
    if (file.type === 'folder') {
      // Recursively find and delete all children
      const deleteChildren = async (parentId) => {
        const children = await File.find({ 
          parentId,
          user: userId
        });
        
        for (const child of children) {
          if (child.type === 'folder') {
            await deleteChildren(child._id);
          }
          // Delete the child file/folder
          await File.findByIdAndDelete(child._id);
          // Delete associated code submission if it exists
          if (child.type === 'file') {
            await CodeSubmission.deleteMany({ fileId: child._id });
          }
        }
      };
      
      await deleteChildren(file._id);
    }
    
    // Delete the file/folder itself
    await File.findByIdAndDelete(fileId);
    
    // Delete associated code submission if it's a file
    if (file.type === 'file') {
      await CodeSubmission.deleteMany({ fileId });
    }
    
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
});

// @desc    Move a file or folder to a new location
// @route   PUT /api/files/:id/move
// @access  Private
const moveFile = asyncHandler(async (req, res) => {
  try {
    const fileId = req.params.id;
    const { newParentId = null } = req.body;
    const userId = req.user._id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }
    
    // Find the file to move
    const file = await File.findOne({ 
      _id: fileId,
      user: userId,
      isDeleted: false
    });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Verify the new parent exists if it's not null (root)
    let newParentPath = '/';
    if (newParentId) {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(newParentId)) {
        return res.status(400).json({ message: 'Invalid parent directory ID' });
      }
      
      // Cannot move a folder into itself or its children
      if (file.type === 'folder') {
        if (newParentId === fileId.toString()) {
          return res.status(400).json({ message: 'Cannot move a folder into itself' });
        }
        
        // Check if newParentId is a child of the folder being moved
        const isChildOfSource = async (parentId) => {
          if (!parentId) return false;
          
          const parent = await File.findById(parentId);
          if (!parent) return false;
          
          if (parent._id.toString() === fileId.toString()) return true;
          
          return await isChildOfSource(parent.parentId);
        };
        
        if (await isChildOfSource(newParentId)) {
          return res.status(400).json({ message: 'Cannot move a folder into its own child folder' });
        }
      }
      
      const newParent = await File.findOne({ 
        _id: newParentId,
        user: userId,
        type: 'folder',
        isDeleted: false
      });
      
      if (!newParent) {
        return res.status(404).json({ message: 'New parent folder not found' });
      }
      
      newParentPath = newParent.path === '/' 
        ? `/${newParent.name}` 
        : `${newParent.path}/${newParent.name}`;
    }
    
    // Check if a file with the same name already exists in the destination
    const existingFile = await File.findOne({
      name: file.name,
      parentId: newParentId || null,
      user: userId,
      isDeleted: false,
      _id: { $ne: fileId } // Exclude the file being moved
    });
    
    if (existingFile) {
      return res.status(400).json({ 
        message: `A ${existingFile.type} with this name already exists in the destination folder` 
      });
    }
    
    // Update the file's parent and path
    file.parentId = newParentId || null;
    file.path = newParentPath;
    await file.save();
    
    // If it's a folder, update the paths of all children
    if (file.type === 'folder') {
      const updateChildrenPaths = async (folderId, basePath) => {
        const children = await File.find({ 
          parentId: folderId,
          user: userId,
          isDeleted: false
        });
        
        for (const child of children) {
          child.path = basePath;
          await child.save();
          
          if (child.type === 'folder') {
            const childPath = basePath === '/' 
              ? `/${child.name}` 
              : `${basePath}/${child.name}`;
            await updateChildrenPaths(child._id, childPath);
          }
        }
      };
      
      const newFolderPath = newParentPath === '/' 
        ? `/${file.name}` 
        : `${newParentPath}/${file.name}`;
      await updateChildrenPaths(file._id, newFolderPath);
    }
    
    res.status(200).json({ message: 'File moved successfully' });
  } catch (error) {
    console.error('Error moving file:', error);
    res.status(500).json({ message: 'Failed to move file', error: error.message });
  }
});

module.exports = {
  getUserFiles,
  getFileTree,
  getFileById,
  createFile,
  updateFile,
  deleteFile,
  moveFile
}; 