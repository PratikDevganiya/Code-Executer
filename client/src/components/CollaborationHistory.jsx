import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUsers, FaUserEdit, FaCalendarAlt, FaFileCode, FaChevronRight, FaExclamationTriangle, FaClock } from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";

const CollaborationHistory = ({ history = [], onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [collaborations, setCollaborations] = useState(history);
  const navigate = useNavigate();
  
  // Update collaborations when history prop changes
  useEffect(() => {
    setCollaborations(history);
  }, [history]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const timeOptions = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year} at ${date.toLocaleTimeString('en-US', timeOptions)}`;
  };

  // Handle view collaboration
  const handleView = (roomId) => {
    navigate(`/collaborate/${roomId}`);
  };

  // Handle delete collaboration
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this collaboration?")) {
      try {
        setDeletingId(id);
        setLoading(true);
        setError(null);
        
        const response = await axios.delete(`http://localhost:5001/api/code/collaborations/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        
        // Check if the response is successful and has success flag
        if (response.status >= 200 && response.status < 300 && response.data.success) {
          // Update local state to remove the deleted collaboration
          setCollaborations(prevCollabs => prevCollabs.filter(collab => collab._id !== id));
          
          // Call onDelete callback if provided (for parent component state update)
          if (typeof onDelete === 'function') {
            onDelete(id);
          }
        } else {
          throw new Error(response.data?.message || "Failed to delete collaboration");
        }
      } catch (error) {
        console.error("Error deleting collaboration:", error);
        
        // Get the most specific error message possible
        const errorMessage = 
          error.response?.data?.message || 
          error.message || 
          "Error deleting collaboration";
        
        setError(errorMessage);
        
        // Auto-dismiss error after 3 seconds
        setTimeout(() => {
          setError(null);
        }, 3000);
      } finally {
        setLoading(false);
        setDeletingId(null);
      }
    }
  };

  // If there's an error
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
        <FaExclamationTriangle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  // Sort collaborations by date (newest first)
  const sortedCollaborations = [...collaborations].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.createdAt);
    const dateB = new Date(b.timestamp || b.createdAt);
    return dateB - dateA;
  });

  return (
    <div className="w-full">
      {collaborations.length > 0 ? (
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center bg-[#F5F5F5] px-4 py-2 border-b border-[#88BDBC]/20 rounded-t-lg">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-[#88BDBC]" />
              <span className="text-[#254E58] font-medium font-['Montserrat']">Timeline View</span>
            </div>
          </div>

          {/* Timeline View with Scrollable Container - Compact height for balanced view */}
          <div className="bg-white rounded-b-lg p-4">
            <div className="relative max-h-[330px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[#88BDBC]/30"></div>
              
              <div className="space-y-4">
                {sortedCollaborations.map((entry, index) => (
                  <div key={entry._id || index} className="ml-10 relative">
                    <div className="absolute -left-10 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 rounded-full bg-[#88BDBC] flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-[#88BDBC]/20 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FaClock className="text-[#88BDBC] text-sm" />
                            <span className="text-[#254E58] text-sm font-medium">
                              {formatDate(entry.timestamp || entry.createdAt)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#88BDBC]/20 rounded-full flex items-center justify-center text-[#254E58]">
                              <FaUserEdit />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[#254E58] font-['Montserrat']">
                                  {entry.editor || "Unknown"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <FaFileCode className="text-[#88BDBC] text-sm" />
                                <span className="text-[#112D32] font-['Montserrat']">
                                  {entry.documentName || "Untitled Document"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:items-end gap-2">
                          <div className="px-3 py-1 bg-[#88BDBC]/10 text-[#254E58] text-xs font-medium rounded-full border border-[#88BDBC]/30 flex items-center self-start sm:self-auto">
                            <span className="w-2 h-2 bg-[#88BDBC] rounded-full mr-1.5"></span>
                            {entry.language}
                          </div>
                          
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleView(entry.roomId)}
                              className="px-3 py-1 text-white bg-[#88BDBC] rounded-md transition-colors border border-[#88BDBC]/70 font-medium text-sm hover:bg-[#254E58] flex items-center gap-1"
                              disabled={loading && deletingId === entry._id}
                            >
                              View <FaChevronRight className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry._id)}
                              className="px-3 py-1 text-white bg-red-500 rounded-md transition-colors border border-red-400 font-medium text-sm hover:bg-red-600 flex items-center gap-1"
                              disabled={loading && deletingId === entry._id}
                            >
                              {loading && deletingId === entry._id ? (
                                <span className="flex items-center gap-1">
                                  <LoadingSpinner size="small" />
                                  Deleting...
                                </span>
                              ) : (
                                "Delete"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-white rounded-lg border border-[#88BDBC]/20">
          <FaUsers className="w-12 h-12 text-[#88BDBC] mb-3" />
          <h3 className="text-lg font-medium text-[#254E58] mb-1 font-['Righteous']">No collaboration history</h3>
          <p className="text-[#112D32] mb-3 font-['Montserrat']">Your collaboration history will appear here</p>
        </div>
      )}
    </div>
  );
};

export default CollaborationHistory;
