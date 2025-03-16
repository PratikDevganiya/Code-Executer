import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CollaborativeEditor from '../components/CollaborativeEditor';
import { v4 as uuidv4 } from 'uuid';
import { FaShareAlt, FaCopy, FaArrowLeft } from 'react-icons/fa';

const CollaborativeEditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [language, setLanguage] = useState('javascript');
  
  // Generate a room ID if one isn't provided
  useEffect(() => {
    if (!roomId) {
      const newRoomId = uuidv4();
      navigate(`/collaborate/${newRoomId}`);
    }
  }, [roomId, navigate]);

  const copyRoomLink = () => {
    const link = `${window.location.origin}/collaborate/${roomId}`;
    navigator.clipboard.writeText(link);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const goBack = () => {
    navigate('/');
  };

  if (!roomId) {
    return <div className="min-h-screen bg-[#88BDBC] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#88BDBC] p-6 flex flex-col font-['Poppins']">
      <div className="w-full flex justify-between items-center mb-4">
        <button 
          onClick={goBack}
          className="flex items-center gap-2 px-4 py-2 bg-[#254E58] text-white rounded-md hover:bg-[#112D32] transition-colors"
        >
          <FaArrowLeft /> Back
        </button>
        
        <div className="flex items-center gap-4">
          <select
            className="px-3 py-2 bg-[#254E58] text-white font-semibold rounded-md 
               shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 
               focus:ring-[#88BDBC] transition cursor-pointer hover:bg-[#112D32]"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
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
          </select>
          
          <div className="relative">
            <button
              onClick={copyRoomLink}
              className="flex items-center gap-2 px-4 py-2 bg-[#254E58] text-white rounded-md hover:bg-[#112D32] transition-colors"
            >
              <FaShareAlt /> Share Room
            </button>
            {showCopiedMessage && (
              <div className="absolute top-full mt-2 right-0 bg-white text-[#254E58] px-3 py-1 rounded-md shadow-md">
                Link copied!
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
        <CollaborativeEditor 
          roomId={roomId} 
          initialCode="// Start collaborative coding here..." 
          language={language}
        />
      </div>
    </div>
  );
};

export default CollaborativeEditorPage;