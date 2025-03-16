import axios from 'axios';

// Base URL for API
const API_URL = '/api/submissions';

/**
 * Save a code submission
 * @param {Object} submissionData - The submission data
 * @returns {Promise} - The saved submission
 */
const saveSubmission = async (submissionData) => {
  const response = await axios.post(API_URL, submissionData);
  return response.data;
};

/**
 * Get user's code submissions with optional filtering
 * @param {Object} filters - Optional filters (language, status, startDate, endDate, page)
 * @returns {Promise} - The submissions and pagination info
 */
const getSubmissions = async (filters = {}) => {
  // Build query string from filters
  const queryParams = new URLSearchParams();
  if (filters.language) queryParams.append('language', filters.language);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.page) queryParams.append('page', filters.page);
  
  const response = await axios.get(`${API_URL}?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get a single submission by ID
 * @param {string} id - The submission ID
 * @returns {Promise} - The submission
 */
const getSubmissionById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

/**
 * Delete a submission
 * @param {string} id - The submission ID
 * @returns {Promise} - The response
 */
const deleteSubmission = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const codeSubmissionService = {
  saveSubmission,
  getSubmissions,
  getSubmissionById,
  deleteSubmission
};

export default codeSubmissionService; 