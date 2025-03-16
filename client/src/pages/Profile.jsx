import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import UserDetails from "../components/UserDetails";
import RecentSubmissions from "../components/RecentSubmissions";
import CollaborationHistory from "../components/CollaborationHistory";
import { FaSignOutAlt, FaCode, FaHistory } from "react-icons/fa";

const Profile = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [collabHistory, setCollabHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Separate refs to prevent redundant API calls
  const hasFetchedProfile = useRef(false);
  const hasFetchedData = useRef(false);

  // ✅ Fetch Submissions & Collaborations (Only When User Exists)
  useEffect(() => {
    if (!user || hasFetchedData.current) return;
    hasFetchedData.current = true;

    const fetchData = async () => {
      try {
        console.log("Fetching submission & collaboration data...");
        const baseURL = "http://localhost:5001/api/code";

        const [submissionsRes, collabRes] = await Promise.all([
          axios.get(`${baseURL}/submissions`),
          axios.get(`${baseURL}/collaborations`),
        ]);

        console.log("Submissions Response:", submissionsRes.data); // 🔍 Debugging Log
        console.log("Collaboration Response:", collabRes.data);

        setSubmissions(
          Array.isArray(submissionsRes.data) ? submissionsRes.data : []
        );
        setCollabHistory(Array.isArray(collabRes.data) ? collabRes.data : []);
      } catch (error) {
        console.error(
          "Failed to fetch data:",
          error.response ? error.response.data : error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const updateUser = async (updatedUser) => {
    try {
      const res = await axios.put("/users/update", updatedUser);
      if (setUser) setUser(res.data);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-['Montserrat'] flex flex-col items-center py-8 px-6 relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#88BDBC]/20 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-full h-20 bg-gradient-to-t from-[#88BDBC]/20 to-transparent"></div>
      <div className="absolute -left-20 top-40 w-40 h-40 rounded-full bg-[#88BDBC]/10 pulse-animation"></div>
      <div className="absolute -right-20 bottom-40 w-40 h-40 rounded-full bg-[#88BDBC]/10 pulse-animation"></div>

      <div className="max-w-[1400px] w-full grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="md:col-span-1">
          <UserDetails user={user} updateUser={updateUser} />
        </div>
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#88BDBC] w-full overflow-x-hidden relative transition-all duration-300 hover:shadow-xl">
            <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-[#88BDBC]/5 rounded-full"></div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#254E58] flex items-center gap-2 font-['Righteous'] tracking-wide">
                <span className="text-2xl">📌</span> Recent Submissions
              </h2>
              {submissions.length > 0 && (
                <span className="bg-[#88BDBC]/20 text-[#254E58] text-sm py-1 px-3 rounded-full font-medium">
                  {submissions.length} total
                </span>
              )}
            </div>
            <div className="mt-4 w-full relative z-10">
              <RecentSubmissions />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#88BDBC] relative transition-all duration-300 hover:shadow-xl">
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-[#88BDBC]/5 rounded-full"></div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#254E58] flex items-center gap-2 font-['Righteous'] tracking-wide">
                <span className="text-2xl">🤝</span> Collaboration History
              </h2>
            </div>
            <div className="relative z-10">
              <CollaborationHistory 
                history={collabHistory} 
                onDelete={(id) => {
                  // Update the collabHistory state when a collaboration is deleted
                  setCollabHistory(prevHistory => prevHistory.filter(collab => collab._id !== id));
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="mt-10 group relative overflow-hidden bg-white border border-[#88BDBC] text-[#254E58] px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 font-medium"
      >
        <span className="absolute inset-0 w-0 bg-gradient-to-r from-[#88BDBC] to-[#254E58] transition-all duration-300 ease-out group-hover:w-full"></span>
        <span className="relative flex items-center gap-2 group-hover:text-white transition-colors duration-300">
          <FaSignOutAlt className="text-lg" /> 
          <span>Sign Out</span>
        </span>
      </button>
    </div>
  );
};

export default Profile;
