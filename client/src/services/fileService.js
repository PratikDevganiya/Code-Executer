import axios from '../config/axios';

// Base URL for File API - using the correct path without duplicate /api/
const API_URL = '/files';

/**
 * Get all user files with optional parent directory filter
 * @param {string|null} parentId - Optional parent directory ID
 * @returns {Promise} - The files
 */
const getUserFiles = async (parentId = null) => {
  const params = parentId !== null ? { parentId } : {};
  const response = await axios.get(API_URL, { params });
  return response.data;
};

/**
 * Get a hierarchical file tree
 * @returns {Promise} - The file tree
 */
const getFileTree = async () => {
  const response = await axios.get(`${API_URL}/tree`);
  return response.data;
};

/**
 * Get a file by ID
 * @param {string} id - The file ID
 * @returns {Promise} - The file
 */
const getFileById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Create a new file or folder
 * @param {Object} fileData - The file data (name, type, content, parentId)
 * @returns {Promise} - The created file
 */
const createFile = async (fileData) => {
  try {
    const response = await axios.post(API_URL, fileData);
    return response.data;
  } catch (error) {
    // If we get any error, wait and verify if the file was created
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Get the complete file tree
      const fileTree = await getFileTree();
      
      // Recursive function to search for the file in the tree
      const findFileInTree = (files, fileName, parentId) => {
        for (const file of files) {
          // Check if this is the file we're looking for
          if (file.name === fileName && file.parentId === parentId) {
            return true;
          }
          // If this is a folder, search its children
          if (file.children && file.children.length > 0) {
            if (findFileInTree(file.children, fileName, parentId)) {
              return true;
            }
          }
        }
        return false;
      };
      
      // Check if the file exists in the tree
      const fileExists = findFileInTree(fileTree, fileData.name, fileData.parentId);
      
      if (fileExists) {
        // File was created successfully, return success response
        return { success: true, message: 'File created successfully' };
      }
    } catch (verifyError) {
      console.error('Error verifying file creation:', verifyError);
    }
    
    // If we couldn't verify the file exists, throw the original error
    throw error;
  }
};

/**
 * Update a file's name or content
 * @param {string} id - The file ID
 * @param {Object} updateData - The data to update (name, content)
 * @returns {Promise} - The updated file
 */
const updateFile = async (id, updateData) => {
  const response = await axios.put(`${API_URL}/${id}`, updateData);
  return response.data;
};

/**
 * Delete a file or folder
 * @param {string} id - The file ID
 * @returns {Promise} - The response
 */
const deleteFile = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Move a file to a new location
 * @param {string} id - The file ID
 * @param {string|null} newParentId - The new parent folder ID (null for root)
 * @returns {Promise} - The response
 */
const moveFile = async (id, newParentId) => {
  const response = await axios.put(`${API_URL}/${id}/move`, { newParentId });
  return response.data;
};

const fileService = {
  getUserFiles,
  getFileTree,
  getFileById,
  createFile,
  updateFile,
  deleteFile,
  moveFile
};

export default fileService; 