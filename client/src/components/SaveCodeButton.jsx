import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const SaveCodeButton = ({ code, language, input, output, submissionId, isCollaborative, roomId, roomParticipants = [] }) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [buttonText, setButtonText] = useState(`Save ${isCollaborative ? 'Collaboration' : 'Code'}`);

  // Reset button text when isCollaborative changes
  useEffect(() => {
    if (!saved) {
      setButtonText(`Save ${isCollaborative ? 'Collaboration' : 'Code'}`);
    }
  }, [isCollaborative, saved]);

  const handleSave = async () => {
    if (!user) {
      alert("Please login to save code");
      return;
    }

    if (!code || !language) {
      alert("Code and language are required");
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setButtonText("Saving...");
      
      if (isCollaborative && roomId) {
        // Save as collaboration
        const currentUser = user.username || user.email || 'Anonymous';
        
        // Create a list of participants including the current user and any provided roomParticipants
        const participantsList = [...new Set([currentUser, ...roomParticipants])];
        
        const collaborationData = {
          roomId,
          code,
          language,
          documentName: `${language.charAt(0).toUpperCase() + language.slice(1)} Collaboration`,
          editor: currentUser,
          participants: participantsList,
          timestamp: new Date().toISOString()
        };
        
        try {
          const response = await axios.post(
            "http://localhost:5001/api/code/collaborations", 
            collaborationData,
            {
              headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
              }
            }
          );
  
          if (!response.data) {
            throw new Error("Failed to save collaboration");
          }
  
          console.log("Collaboration saved/updated successfully:", response.data);
          
          // Set saved state to true even if there was a 409 error (already exists)
          setSaved(true);
          setButtonText("Saved!");
          
          // Reset button after 5 seconds
          setTimeout(() => {
            setSaved(false);
            setButtonText(`Save ${isCollaborative ? 'Collaboration' : 'Code'}`);
          }, 5000);
        } catch (collabError) {
          console.error("Error saving collaboration:", collabError);
          
          // If it's a 409 error (conflict/duplicate), we can treat it as a success
          if (collabError.response?.status === 409) {
            console.log("Collaboration already exists, treating as success");
            setSaved(true);
            setButtonText("Saved!");
            
            // Reset button after 5 seconds
            setTimeout(() => {
              setSaved(false);
              setButtonText(`Save ${isCollaborative ? 'Collaboration' : 'Code'}`);
            }, 5000);
            return;
          }
          
          // For other errors, show an error message
          const errorMessage = collabError.response?.data?.message || collabError.message || "Failed to save collaboration";
          alert(errorMessage);
          setSaved(false);
          setButtonText(`Save ${isCollaborative ? 'Collaboration' : 'Code'}`);
        }
      } else {
        // Save as normal submission
        const submissionData = {
          code,
          language,
          input: input || '',
          output: output || '',
          status: output?.includes("Error") ? "error" : "completed"
        };
        
        if (submissionId) {
          await axios.put(
            `http://localhost:5001/api/submissions/${submissionId}`, 
            submissionData,
            {
              headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } else {
          await axios.post(
            "http://localhost:5001/api/submissions",
            submissionData,
            {
              headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }
        
        // Set saved state to true after successful submission
        setSaved(true);
        setButtonText("Saved!");
        
        // Reset button after 5 seconds
        setTimeout(() => {
          setSaved(false);
          setButtonText(`Save ${isCollaborative ? 'Collaboration' : 'Code'}`);
        }, 5000);
      }
    } catch (error) {
      console.error('Error saving code:', error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to save ${isCollaborative ? 'collaboration' : 'code'}`;
      alert(errorMessage);
      setSaved(false);
      setButtonText(`Save ${isCollaborative ? 'Collaboration' : 'Code'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      data-save-button
      className={`w-full py-2 text-white font-semibold rounded-lg 
                shadow-md transition-colors disabled:opacity-50 
                disabled:cursor-not-allowed text-sm
                ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-[#254E58] hover:bg-[#112D32]'}`}
      onClick={handleSave}
      disabled={saving || !code.trim() || !user || (isCollaborative && !roomId)}
    >
      <span className="flex items-center justify-center gap-2">
        {saving && <LoadingSpinner size="small" />}
        {saved && (
          <svg 
            className="w-5 h-5 text-white animate-bounce" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        )}
        <span>{buttonText}</span>
      </span>
    </button>
  );
};

export default SaveCodeButton; 