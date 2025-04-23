import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Editor from "@monaco-editor/react";
import LoadingSpinner from '../components/LoadingSpinner';
import { FaArrowLeft } from 'react-icons/fa';

const SharedCodeView = () => {
  const { shareId } = useParams();
  const [sharedCode, setSharedCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedCode = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/share/${shareId}`);
        setSharedCode(response.data);
      } catch (err) {
        console.error('Error fetching shared code:', err);
        setError(err.response?.data?.message || 'Failed to load shared code');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedCode();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#88BDBC] p-6 flex flex-col items-center justify-center font-['Poppins']">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl w-full flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#88BDBC] p-6 flex flex-col items-center justify-center font-['Poppins']">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl w-full">
          <div className="text-red-500 text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{error}</p>
            <Link 
              to="/" 
              className="mt-6 inline-block px-4 py-2 bg-[#254E58] text-white rounded-md hover:bg-[#112D32] transition-colors"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!sharedCode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#88BDBC] p-6 flex flex-col items-center font-['Poppins']">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl w-full mb-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#254E58] flex items-center gap-2">
            <span>Shared Code</span>
            <span className="text-sm bg-[#88BDBC]/20 text-[#254E58] px-2 py-1 rounded-full">
              {sharedCode.language}
            </span>
          </h1>
          <Link 
            to="/" 
            className="flex items-center gap-1 text-[#254E58] hover:text-[#88BDBC] transition-colors"
          >
            <FaArrowLeft size={14} />
            <span>Back to Editor</span>
          </Link>
        </div>
        
        <div className="border border-[#88BDBC] rounded-lg overflow-hidden shadow-md mb-6">
          <Editor
            height="60vh"
            language={sharedCode.language?.toLowerCase()}
            value={sharedCode.code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 10, bottom: 10 },
            }}
          />
        </div>
        
        {(sharedCode.input || sharedCode.output) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sharedCode.input && (
              <div className="border border-[#254E58]/30 rounded-lg bg-[#112D32] text-white shadow-md overflow-hidden">
                <div className="px-2 py-1.5 border-b border-[#88BDBC]/30 text-sm">
                  🔹 Input
                </div>
                <pre className="p-3 whitespace-pre-wrap text-xs font-['Fira Code'] max-h-[200px] overflow-auto">
                  {sharedCode.input}
                </pre>
              </div>
            )}
            
            {sharedCode.output && (
              <div className="border border-[#254E58]/30 rounded-lg bg-[#254E58] text-white shadow-md overflow-hidden">
                <div className="px-2 py-1.5 border-b border-[#88BDBC]/30 text-sm">
                  📝 Output
                </div>
                <pre className="p-3 whitespace-pre-wrap text-xs font-['Fira Code'] max-h-[200px] overflow-auto">
                  {sharedCode.output}
                </pre>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="px-4 py-2 bg-[#254E58] text-white rounded-md hover:bg-[#112D32] transition-colors"
          >
            Open in Editor
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedCodeView; 