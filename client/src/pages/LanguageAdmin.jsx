import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const LanguageAdmin = () => {
  const { user } = useAuth();
  const [languages, setLanguages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [installInstructions, setInstallInstructions] = useState(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5001/api/code/languages");
        setLanguages(response.data.languages);
        setError(null);
      } catch (err) {
        setError("Failed to fetch language information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  const getInstallInstructions = async (language) => {
    try {
      setSelectedLanguage(language);
      const response = await axios.get(`http://localhost:5001/api/code/languages/${language}/install`);
      setInstallInstructions(response.data);
    } catch (err) {
      setInstallInstructions({ error: "Failed to fetch installation instructions" });
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-[#EBE5C2] p-6 flex flex-col items-center justify-center">
        <div className="bg-[#8B8558] text-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBE5C2] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#6B6343] mb-6">Language Support Administration</h1>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#6B6343] mb-4">Language Status</h2>
              <div className="overflow-auto max-h-[70vh]">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-[#8B8558] text-white">
                      <th className="px-4 py-2 text-left">Language</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(languages).map(([id, info]) => (
                      <tr key={id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{info.name}</td>
                        <td className="px-4 py-3">
                          {info.available ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Not Installed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {!info.available && (
                            <button
                              onClick={() => getInstallInstructions(id)}
                              className="text-sm bg-[#8B8558] hover:bg-[#6B6343] text-white py-1 px-3 rounded"
                            >
                              Install Instructions
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#6B6343] mb-4">
                {selectedLanguage 
                  ? `Installation Instructions: ${languages[selectedLanguage]?.name || selectedLanguage}` 
                  : "Select a language to see installation instructions"}
              </h2>
              
              {installInstructions ? (
                installInstructions.error ? (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {installInstructions.error}
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <h3>Required Command: <code>{installInstructions.command}</code></h3>
                    <div className="mt-4">
                      <h4 className="font-bold">Installation Instructions:</h4>
                      <pre className="bg-gray-100 p-4 rounded mt-2 overflow-x-auto">
                        {installInstructions.instructions}
                      </pre>
                    </div>
                    <div className="mt-6 text-sm text-gray-600">
                      <p>After installation, restart the server for the changes to take effect.</p>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-gray-500">
                  Select a language that is not installed to see installation instructions.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageAdmin; 