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
  
  // ✅ Separate refs to prevent redundant API calls
  const hasFetchedProfile = useRef(false); 
  const hasFetchedData = useRef(false); 

  // ✅ Fetch Submissions & Collaborations (Only When User Exists)
  useEffect(() => {
    if (!user || hasFetchedData.current) return; 
    hasFetchedData.current = true;

    const fetchData = async () => {
      try {
        // console.log("Fetching submission & collaboration data...");
        const baseURL = "http://localhost:5001/api/code"; 

        const [submissionsRes, collabRes] = await Promise.all([
          axios.get(`${baseURL}/submissions`),
          axios.get(`${baseURL}/collaborations`),
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#EBE5C2]">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#EBE5C2] font-['Poppins'] flex flex-col items-center py-8 px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <UserDetails user={user} updateUser={updateUser} />
        </div>
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📌 Recent Submissions</h2>
            <RecentSubmissions submissions={submissions} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🤝 Collaboration History</h2>
            <CollaborationHistory history={collabHistory} />
          </div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="mt-10 bg-[#8B8558] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#5A5A5A] transition-all flex items-center gap-2"
      >
        <FaSignOutAlt className="text-lg" /> Logout
      </button>
    </div>
  );
};

export default Profile;
