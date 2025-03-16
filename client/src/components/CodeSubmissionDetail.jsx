import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const CodeSubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch submission details
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/submissions/${id}`);
        setSubmission(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  // Handle delete submission
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      await axios.delete(`/api/submissions/${id}`);
      navigate('/profile'); // Redirect to profile page after deletion
    } catch (err) {
      setError('Failed to delete submission');
      console.error(err);
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge bg-success">Success</span>;
      case 'error':
        return <span className="badge bg-danger">Error</span>;
      case 'runtime_error':
        return <span className="badge bg-warning">Runtime Error</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-5" role="alert">
        {error}
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="alert alert-warning my-5" role="alert">
        Submission not found
      </div>
    );
  }

  return (
    <div className="code-submission-detail my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Code Submission</h2>
        <div>
          <button 
            className="btn btn-danger me-2" 
            onClick={handleDelete}
          >
            Delete
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/profile')}
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="me-2">{languageIcons[submission.language] || '📄'}</span>
              <strong>{submission.language}</strong>
            </div>
            <div>
              {getStatusBadge(submission.status)}
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <h5>Code</h5>
            <pre className="bg-light p-3 rounded">
              <code>{submission.code}</code>
            </pre>
          </div>

          {submission.input && (
            <div className="mb-3">
              <h5>Input</h5>
              <pre className="bg-light p-3 rounded">
                <code>{submission.input}</code>
              </pre>
            </div>
          )}

          <div className="mb-3">
            <h5>Output</h5>
            <pre className="bg-light p-3 rounded">
              <code>{submission.output || 'No output'}</code>
            </pre>
          </div>

          <div className="row">
            <div className="col-md-6">
              <p><strong>Execution Time:</strong> {submission.executionTime ? `${submission.executionTime.toFixed(2)} ms` : 'N/A'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Date:</strong> {format(new Date(submission.createdAt), 'MMM d, yyyy h:mm a')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSubmissionDetail; 