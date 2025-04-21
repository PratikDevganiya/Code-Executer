import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { FaCode, FaCalendarAlt, FaChevronRight, FaExclamationTriangle, FaTrash, FaEye, FaChevronDown } from "react-icons/fa";

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
  const getSubmissionContent = (submission) => {
    // Check if it's a file submission by checking for fileName
    if (submission.fileName) {
      return {
        title: submission.fileName,
        content: `File: ${submission.fileName}`,
        isFile: true
      };
    }

    // For manual code submissions
    const code = submission.code || '';
    const cleanedCode = code.trim();
    let displayContent = '';

    if (cleanedCode) {
      const lines = cleanedCode.split('\n');
      const firstLine = lines[0];
      
      if (lines.length > 1) {
        displayContent = `${firstLine.substring(0, 40)}${firstLine.length > 40 ? '...' : ''} // +${lines.length - 1} more lines`;
      } else {
        displayContent = firstLine.length > 60 ? `${firstLine.substring(0, 60)}...` : firstLine;
      }
    }

    return {
      title: languageConfig[submission.language]?.name || submission.language,
      content: displayContent || 'Empty code submission',
      isFile: false
    };
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
        // Fetch both code submissions and file submissions
        const [codeResponse, fileResponse] = await Promise.all([
          axios.get("http://localhost:5001/api/submissions", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }),
          axios.get("http://localhost:5001/api/files", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          })
        ]);
        
        // Get code submissions - handle both array and object response formats
        const codeSubmissions = Array.isArray(codeResponse.data) 
          ? codeResponse.data 
          : codeResponse.data.submissions || [];

        // Get file submissions - filter only files (not folders) and format them
        const fileSubmissions = (Array.isArray(fileResponse.data) ? fileResponse.data : [])
          .filter(file => file.type === 'file')
          .map(file => ({
            _id: file._id,
            code: file.content || '',
            language: getLanguageFromFileName(file.name),
            fileName: file.name,
            status: 'completed',
            createdAt: file.createdAt || new Date().toISOString()
          }));
        
        // Combine and sort by date
        const allSubmissions = [...codeSubmissions, ...fileSubmissions]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setSubmissions(allSubmissions);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
        setError("Failed to load submissions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  // Helper function to determine language from file name
  const getLanguageFromFileName = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const extensionMap = {
      'js': 'javascript',
      'jsx': 'javascript',
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
    return extensionMap[extension] || 'javascript';
  };

  // Filter submissions by language if selected
  const filteredSubmissions = selectedLanguage 
    ? submissions.filter(submission => submission.language === selectedLanguage)
    : submissions;

  const handleViewSubmission = (submission) => {
    if (submission.fileName) {
      // If it's a file submission
      navigate('/editor', {
        state: {
          fileId: submission._id,
          fileName: submission.fileName,
          code: submission.code,
          language: submission.language,
          isFile: true
        }
      });
    } else {
      // If it's a code submission
      navigate('/editor', {
        state: {
          code: submission.code,
          language: submission.language,
          input: submission.input || '',
          output: submission.output || '',
          submissionId: submission._id,
          isFile: false
        }
      });
    }
  };

  // Delete submission
  const handleDelete = async (submission) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        if (submission.fileName) {
          // Delete file
          await axios.delete(`http://localhost:5001/api/files/${submission._id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
        } else {
          // Delete code submission
          await axios.delete(`http://localhost:5001/api/submissions/${submission._id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
        }
        
        // Update submissions list
        setSubmissions(submissions.filter(sub => sub._id !== submission._id));
      } catch (err) {
        console.error("Failed to delete submission:", err);
        alert("Failed to delete submission");
      }
    }
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
              <div className="relative">
                <select
                  className="pl-3 pr-8 py-1 rounded-md border border-[#88BDBC]/30 bg-white text-[#112D32] text-sm focus:outline-none focus:ring-2 focus:ring-[#88BDBC]/60 font-['Montserrat'] w-36 appearance-none cursor-pointer"
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
                <div className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2">
                  <FaChevronDown className="text-[#88BDBC] text-xs" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-b-lg p-4">
              <div className="relative h-[330px] timeline-scroll-container">
                <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                  {filteredSubmissions.map((submission) => {
                    const submissionData = getSubmissionContent(submission);
                    
                    return (
                      <div key={submission._id} className="mb-6 timeline-item">
                        <div className="flex items-center mb-3 relative z-10">
                          <div className="w-6 h-6 rounded-full bg-[#88BDBC] flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                          <div className="ml-4 bg-[#F5F5F5] px-3 py-1 rounded-md text-[#254E58] font-medium font-['Montserrat']">
                            {formatDate(submission.createdAt)}
                          </div>
                        </div>

                        <div className="ml-10 bg-white border border-[#88BDBC]/30 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#88BDBC]/20 flex items-center justify-center">
                                <FaCode className="text-[#88BDBC]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-[#254E58] font-medium">
                                    {languageConfig[submission.language]?.name || submission.language}
                                  </h3>
                                  {getStatusBadge(submission.status)}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewSubmission(submission)}
                                className="p-2 text-[#88BDBC] hover:text-[#254E58] transition-colors rounded-full hover:bg-[#88BDBC]/10"
                                title="View Submission"
                              >
                                <FaEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(submission)}
                                className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100"
                                title="Delete Submission"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="bg-[#F5F5F5] p-3 rounded-md font-mono text-sm text-[#254E58]">
                            {submissionData.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-[#254E58] text-lg font-medium mb-2">
              No submissions yet
            </div>
            <div className="text-[#254E58]/70">
              Start coding to see your submissions here
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSubmissions;
