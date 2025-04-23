import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const SubmissionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/submissions/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSubmission(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch submission:', err);
        setError('Failed to load submission details');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchSubmission();
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#EBE5C2]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EBE5C2] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
          <Link
            to="/profile"
            className="mt-4 inline-block text-[#8B8558] hover:text-[#6B6343] font-['Righteous']"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-[#EBE5C2] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
            Submission not found
          </div>
          <Link
            to="/profile"
            className="mt-4 inline-block text-[#8B8558] hover:text-[#6B6343] font-['Righteous']"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBE5C2] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-[#D3C89F] px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-['Righteous'] text-[#6B6343]">
                Submission Details
              </h1>
              <Link
                to="/profile"
                className="text-[#8B8558] hover:text-[#6B6343] bg-[#F5F5DC] px-3 py-1 rounded-md transition-colors border border-[#8B8558] font-['Righteous'] text-sm"
              >
                ← Back to Profile
              </Link>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-[#8B8558] font-['Righteous']">Language</p>
                  <p className="font-['Righteous'] text-yellow-500">{submission.language}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-[#8B8558] font-['Righteous']">Submitted</p>
                  <p className="text-[#6B6343] font-['Righteous']">
                    {new Date(submission.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-[#8B8558] font-['Righteous']">Code</p>
                <div className="bg-[#F5F5DC] rounded-lg border border-[#D3C89F] p-4">
                  <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                    {submission.code}
                  </pre>
                </div>
              </div>

              {submission.input && (
                <div className="space-y-2">
                  <p className="text-sm text-[#8B8558] font-['Righteous']">Input</p>
                  <div className="bg-[#F5F5DC] rounded-lg border border-[#D3C89F] p-4">
                    <pre className="font-mono text-sm whitespace-pre-wrap">
                      {submission.input}
                    </pre>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-[#8B8558] font-['Righteous']">Output</p>
                <div className="bg-[#F5F5DC] rounded-lg border border-[#D3C89F] p-4">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {submission.output || 'No output available'}
                  </pre>
                </div>
              </div>

              {submission.error && (
                <div className="space-y-2">
                  <p className="text-sm text-[#8B8558] font-['Righteous']">Error</p>
                  <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                    <pre className="font-mono text-sm text-red-600 whitespace-pre-wrap">
                      {submission.error}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <p className="text-sm text-[#8B8558] font-['Righteous']">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    submission.status === 'completed'
                      ? 'bg-[#F5F5DC] text-[#6B6343] border border-[#8B8558]'
                      : submission.status === 'error'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  }`}>
                    {submission.status === 'completed' ? 'Success' : 
                     submission.status === 'error' ? 'Error' : 'Runtime Error'}
                  </span>
                </div>
                {submission.executionTime && (
                  <div className="space-y-1">
                    <p className="text-sm text-[#8B8558] font-['Righteous']">Execution Time</p>
                    <p className="text-[#6B6343] font-['Righteous']">
                      {submission.executionTime}ms
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;