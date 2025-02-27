import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { FaSignOutAlt, FaUser, FaCode } from "react-icons/fa";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get("/code/submissions");
        setSubmissions(response.data);
      } catch (error) {
        setError("Failed to fetch submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#EBE5C2] font-['Poppins'] flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-[#F5F2E3] text-[#3B3B3B] shadow-2xl rounded-xl p-8 border border-[#8B8558] backdrop-blur-md">
        {/* Centered Profile Title */}
        <h2 className="text-4xl font-bold text-[#3B3B3B] font-['Righteous'] text-center mb-6">
          Profile
        </h2>

        {/* Profile Card */}
        <div
          className="relative bg-[#EBE5C2]/80 p-6 rounded-xl flex items-center gap-6 shadow-lg 
                        border border-[#8B8558]/40 backdrop-blur-md transition-all duration-300 
                        hover:shadow-2xl hover:scale-[1.02]"
        >
          {/* Profile Picture or Initials */}
          <div
            className="relative w-16 h-16 bg-[#8B8558] flex items-center justify-center rounded-full shadow-md 
                          text-white text-2xl font-bold uppercase hover:scale-110 transition-all duration-300"
          >
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.username?.charAt(0)
            )}
          </div>

          {/* User Information */}
          <div>
            <p className="text-lg font-semibold text-[#3B3B3B]">
              <span className="text-[#8B8558]">Username :</span>{" "}
              {user?.username}
            </p>
            <p className="text-lg font-semibold text-[#3B3B3B]">
              <span className="text-[#8B8558]">Email :</span> {user?.email}
            </p>
            <p className="text-md text-[#5A5A5A] mt-2 italic">
              <span className="text-[#8B8558]">Account Created:</span>{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Recent Submissions Section */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <FaCode className="text-2xl text-[#8B8558]" />
            <h3 className="text-2xl font-semibold text-[#3B3B3B]">
              Recent Submissions
            </h3>
          </div>

          {error && (
            <div className="bg-red-500 text-white px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="text-center py-8 bg-[#F5F2E3] rounded-lg">
                <p className="text-[#8B8558]">No submissions yet</p>
              </div>
            ) : (
              submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="border border-[#8B8558] p-4 rounded-lg 
                           bg-[#F5F2E3] hover:bg-[#E6D4A4] transition-all duration-300 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[#3B3B3B]">
                        <span className="text-[#8B8558] font-medium">
                          Language:
                        </span>{" "}
                        {submission.language}
                      </p>
                      <p className="text-[#3B3B3B]">
                        <span className="text-[#8B8558] font-medium">
                          Status:
                        </span>{" "}
                        <span
                          className={`font-medium ${
                            submission.status === "Success"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {submission.status}
                        </span>
                      </p>
                      {submission.executionTime && (
                        <p className="text-[#3B3B3B]">
                          <span className="text-[#8B8558] font-medium">
                            Execution Time:
                          </span>{" "}
                          {submission.executionTime}ms
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Collapsible Code Section */}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-[#8B8558] font-medium hover:underline">
                      View Code
                    </summary>
                    <pre className="mt-2 p-3 bg-[#5A5A5A] text-[#EBE5C2] rounded overflow-x-auto text-sm">
                      <code>{submission.code}</code>
                    </pre>
                  </details>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Logout Button at the Bottom */}
        <div className="mt-10 text-center">
          <button
            onClick={handleLogout}
            className="relative flex items-center justify-center gap-3 px-6 py-3 
               bg-gradient-to-r from-[#8B8558] to-[#5A5A5A] 
               hover:from-[#5A5A5A] hover:to-[#3B3B3B] 
               text-[#EBE5C2] font-semibold rounded-xl shadow-lg 
               transition-all duration-300 w-full
               backdrop-blur-md bg-opacity-90
               hover:shadow-[#8B8558]/50 hover:scale-105"
          >
            <span className="inline-block transition-transform duration-300 hover:rotate-[-10deg]">
              <FaSignOutAlt />
            </span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
