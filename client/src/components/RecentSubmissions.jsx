import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { FaCode, FaCalendarAlt, FaChevronRight, FaExclamationTriangle } from "react-icons/fa";

// Language colors mapping
const languageConfig = {
  javascript: { color: '#F7DF1E', name: 'JavaScript' },
  typescript: { color: '#3178C6', name: 'TypeScript' },
  python: { color: '#3776AB', name: 'Python' },
  java: { color: '#007396', name: 'Java' },
  c: { color: '#A8B9CC', name: 'C' },
  'c++': { color: '#00599C', name: 'C++' },
  'c#': { color: '#239120', name: 'C#' },
  php: { color: '#777BB4', name: 'PHP' },
  go: { color: '#00ADD8', name: 'Go' },
  rust: { color: '#DEA584', name: 'Rust' },
  ruby: { color: '#CC342D', name: 'Ruby' },
  swift: { color: '#FA7343', name: 'Swift' },
  kotlin: { color: '#7F52FF', name: 'Kotlin' }
};

// Status badges with improved styling
const getStatusBadge = (status) => {
  switch (status) {
    case 'completed':
      return (
        <span className="px-3 py-1 bg-[#88BDBC]/20 text-[#254E58] text-xs font-medium rounded-full border border-[#88BDBC]/60 flex items-center w-fit">
          <span className="w-2 h-2 bg-[#88BDBC] rounded-full mr-1.5"></span>
          Success
        </span>
      );
    case 'error':
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-300 flex items-center w-fit">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
          Error
        </span>
      );
    case 'runtime_error':
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full border border-yellow-300 flex items-center w-fit">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
          Runtime Error
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-300 flex items-center w-fit">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></span>
          {status || "Unknown"}
        </span>
      );
  }
};

const RecentSubmissions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  // Get code snippet with improved formatting
  const getCodeSnippet = (code) => {
    if (!code) return '';
    
    // Remove extra whitespace and newlines
    const cleanedCode = code.trim();
    
    // Get first line of code (up to first newline or 40 chars)
    let firstLine = '';
    const newlineIndex = cleanedCode.indexOf('\n');
    
    if (newlineIndex > -1) {
      // If there's a newline, get content up to that
      firstLine = cleanedCode.substring(0, newlineIndex);
      
      // If first line is too long, truncate it
      if (firstLine.length > 40) {
        firstLine = firstLine.substring(0, 40) + '...';
      }
      
      // Show that there are more lines
      return `${firstLine} // +${cleanedCode.split('\n').length - 1} more lines`;
    } else {
      // No newlines, just truncate if needed
      return cleanedCode.length > 60 ? `${cleanedCode.substring(0, 60)}...` : cleanedCode;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Time formatting options for 12-hour format with AM/PM
    const timeOptions = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    
    // Get day, month, and year separately
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Format as DD/MM/YYYY at 1:26 PM
    return `${day}/${month}/${year} at ${date.toLocaleTimeString('en-US', timeOptions)}`;
  };

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5001/api/submissions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        
        setSubmissions(response.data.submissions || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
        setError("Failed to load code submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  // Filter submissions by language if selected
  const filteredSubmissions = selectedLanguage 
    ? submissions.filter(submission => submission.language === selectedLanguage)
    : submissions;

  // Delete submission
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        await axios.delete(`http://localhost:5001/api/submissions/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        
        // Update submissions list
        setSubmissions(submissions.filter(sub => sub._id !== id));
      } catch (err) {
        console.error("Failed to delete submission:", err);
        alert("Failed to delete submission");
      }
    }
  };

  const handleViewSubmission = (submission) => {
    navigate('/editor', {
      state: {
        submissionData: {
          code: submission.code,
          language: submission.language,
          input: submission.input || "",
          output: submission.output || ""
        },
        submissionId: submission._id
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
        <FaExclamationTriangle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  // Group submissions by date
  const groupSubmissionsByDate = () => {
    const groups = {};
    
    filteredSubmissions.forEach(submission => {
      const date = new Date(submission.createdAt);
      const dateKey = date.toLocaleDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(submission);
    });
    
    return groups;
  };

  const submissionGroups = groupSubmissionsByDate();

  return (
    <div className="bg-transparent rounded-lg overflow-hidden w-full">
      <div className="p-0">
        {submissions.length > 0 ? (
          <>
            <div className="flex justify-between items-center bg-[#F5F5F5] px-4 py-2 border-b border-[#88BDBC]/20 rounded-t-lg">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-[#88BDBC]" />
                <span className="text-[#254E58] font-medium font-['Montserrat']">Timeline View</span>
              </div>
              <select
                className="px-3 py-1 rounded-md border border-[#88BDBC]/30 bg-white text-[#112D32] text-sm focus:outline-none focus:ring-2 focus:ring-[#88BDBC]/60 font-['Montserrat'] w-36"
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                }}
              >
                <option value="">All Languages</option>
                {Object.entries(languageConfig).map(([key, { name }]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-b-lg p-4">
              {/* Timeline View with Scrollable Container - Compact height for balanced view */}
              <div className="relative max-h-[330px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[#88BDBC]/30"></div>
                
                {filteredSubmissions.map((submission, index) => (
                  <div key={submission._id} className="mb-6">
                    {/* Individual Date header */}
                    <div className="flex items-center mb-3 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-[#88BDBC] flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div className="ml-4 bg-[#F5F5F5] px-3 py-1 rounded-md text-[#254E58] font-medium font-['Montserrat']">
                        {formatDate(submission.createdAt)}
                      </div>
                    </div>
                    
                    {/* Individual Submission */}
                    <div className="ml-10 space-y-3">
                      <div 
                        className="bg-white border border-[#88BDBC]/20 rounded-lg p-4 hover:shadow-md transition-all duration-200 relative"
                      >
                        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[#88BDBC]/50 rounded-full"></div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: languageConfig[submission.language]?.color || '#ccc'
                                }}
                              ></div>
                              <span className="font-['Montserrat'] text-[#254E58] font-medium">
                                {languageConfig[submission.language]?.name || submission.language}
                              </span>
                            </div>
                            
                            <div className="bg-[#F5F5F5] p-3 rounded-md mb-2">
                              <code className="text-xs text-[#112D32] font-mono whitespace-pre-wrap">
                                {getCodeSnippet(submission.code)}
                              </code>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:items-end gap-2">
                            {getStatusBadge(submission.status)}
                            
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleViewSubmission(submission)}
                                className="px-3 py-1 text-white bg-[#88BDBC] rounded-md transition-colors border border-[#88BDBC]/70 font-medium text-sm hover:bg-[#254E58] flex items-center gap-1"
                              >
                                View <FaChevronRight className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleDelete(submission._id)}
                                className="px-3 py-1 text-white bg-red-500 rounded-md transition-colors border border-red-400 font-medium text-sm hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-white rounded-lg border border-[#88BDBC]/20">
            <FaCode className="w-12 h-12 text-[#88BDBC] mb-3" />
            <h3 className="text-lg font-medium text-[#254E58] mb-1 font-['Righteous']">No submissions found</h3>
            <p className="text-[#112D32] mb-3 font-['Montserrat']">Try saving some code from the editor first!</p>
            <Link 
              to="/"
              className="px-4 py-2 bg-[#88BDBC] text-white rounded-md hover:bg-[#254E58] transition-colors font-medium"
            >
              Go to Code Editor
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSubmissions;
