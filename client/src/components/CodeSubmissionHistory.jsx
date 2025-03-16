import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

// Language icons mapping
const languageIcons = {
  javascript: '🟨',
  typescript: '🔷',
  python: '🐍',
  java: '☕',
  c: '🔤',
  'c++': '🔣',
  'c#': '🎮',
  php: '🐘',
  go: '🔵',
  rust: '⚙️',
  ruby: '💎',
  swift: '🍎',
  kotlin: '🤖'
};

// Status badges
const statusBadges = {
  completed: <span className="badge bg-success">Success</span>,
  error: <span className="badge bg-danger">Error</span>,
  runtime_error: <span className="badge bg-warning">Runtime Error</span>
};

const CodeSubmissionHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    language: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1
  });

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.language) queryParams.append('language', filters.language);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      queryParams.append('page', filters.page);
      
      const response = await axios.get(`/api/submissions?${queryParams.toString()}`);
      
      setSubmissions(response.data.submissions);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to fetch code submissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load submissions on component mount and when filters change
  useEffect(() => {
    fetchSubmissions();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to page 1 when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Get code snippet (first 50 chars)
  const getCodeSnippet = (code) => {
    if (!code) return '';
    return code.length > 50 ? `${code.substring(0, 50)}...` : code;
  };

  return (
    <div className="code-submission-history">
      <h2>Code Submission History</h2>
      
      {/* Filters */}
      <div className="filters mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Language</label>
            <select 
              className="form-select" 
              name="language" 
              value={filters.language} 
              onChange={handleFilterChange}
            >
              <option value="">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="c++">C++</option>
              <option value="c#">C#</option>
              <option value="php">PHP</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="ruby">Ruby</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
            </select>
          </div>
          
          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select 
              className="form-select" 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="completed">Success</option>
              <option value="error">Error</option>
              <option value="runtime_error">Runtime Error</option>
            </select>
          </div>
          
          <div className="col-md-3">
            <label className="form-label">Start Date</label>
            <input 
              type="date" 
              className="form-control" 
              name="startDate" 
              value={filters.startDate} 
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="col-md-3">
            <label className="form-label">End Date</label>
            <input 
              type="date" 
              className="form-control" 
              name="endDate" 
              value={filters.endDate} 
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Submissions table */}
          {submissions.length === 0 ? (
            <div className="alert alert-info">
              No code submissions found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Language</th>
                    <th>Code Snippet</th>
                    <th>Status</th>
                    <th>Date/Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(submission => (
                    <tr key={submission._id}>
                      <td>
                        <span className="me-2">{languageIcons[submission.language] || '📄'}</span>
                        {submission.language}
                      </td>
                      <td>
                        <code>{getCodeSnippet(submission.code)}</code>
                      </td>
                      <td>
                        {statusBadges[submission.status] || statusBadges.error}
                      </td>
                      <td>
                        {format(new Date(submission.createdAt), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td>
                        <a 
                          href={`/submissions/${submission._id}`} 
                          className="btn btn-sm btn-primary"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <nav aria-label="Submission pagination">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(pagination.pages).keys()].map(page => (
                  <li 
                    key={page + 1} 
                    className={`page-item ${pagination.page === page + 1 ? 'active' : ''}`}
                  >
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(page + 1)}
                    >
                      {page + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default CodeSubmissionHistory; 