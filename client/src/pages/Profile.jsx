import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import UserDetails from "../components/UserDetails";
import RecentSubmissions from "../components/RecentSubmissions";
import CollaborationHistory from "../components/CollaborationHistory";
import { FaSignOutAlt } from "react-icons/fa";

const Profile = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [collabHistory, setCollabHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasFetchedProfile = useRef(false);
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (!user || hasFetchedData.current) return;
    hasFetchedData.current = true;

    const fetchData = async () => {
      try {
        const [submissionsRes, collabRes] = await Promise.all([
          axios.get('/code/submissions'),
          axios.get('/code/collaborations'),
        ]);

        setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
        setCollabHistory(Array.isArray(collabRes.data) ? collabRes.data : []);
      } catch (error) {
        console.error("Failed to fetch data:", error.response ? error.response.data : error);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Montserrat']">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* User Details Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-[#88BDBC]/20 overflow-hidden">
              <UserDetails user={user} updateUser={updateUser} />
            </div>
          </div>

          {/* Right Column - Submissions and Collaborations */}
          <div className="md:col-span-2 space-y-4">
            {/* Recent Submissions */}
            <div className="bg-white rounded-lg shadow-md border-l-4 border-[#88BDBC] overflow-hidden">
              <div className="p-4">
                <h2 className="text-lg font-bold text-[#254E58] flex items-center gap-2">
                  <span className="text-xl">📌</span> Recent Submissions
                </h2>
                <div className="mt-2">
                  <RecentSubmissions />
                </div>
              </div>
            </div>

            {/* Collaboration History */}
            <div className="bg-white rounded-lg shadow-md border-l-4 border-[#88BDBC] overflow-hidden">
              <div className="p-4">
                <h2 className="text-lg font-bold text-[#254E58] flex items-center gap-2">
                  <span className="text-xl">🤝</span> Collaboration History
                </h2>
                <div className="mt-2">
                  <CollaborationHistory 
                    history={collabHistory}
                    onDelete={(id) => {
                      setCollabHistory(prevHistory => prevHistory.filter(collab => collab._id !== id));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Logout Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#88BDBC] text-[#254E58] rounded-md hover:bg-[#88BDBC] hover:text-white transition-colors duration-200"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
