import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      await register(formData.username, formData.email, formData.password);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#88BDBC] font-['Poppins'] px-4 -mt-20">
      {/* Glassmorphic Register Card */}
      <div className="max-w-md w-full p-8 bg-white backdrop-blur-md rounded-xl shadow-2xl border border-[#254E58]/30">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#254E58] font-['Righteous'] tracking-wide">
            Create Account
          </h2>
          <p className="text-[#112D32] mt-2 font-['Montserrat']">
            Join us and start coding today!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded-lg text-center mt-4 shadow-md">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="relative">
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full bg-[#F5F5F5] text-[#112D32] placeholder-[#254E58]/60 px-4 py-3 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-[#88BDBC] border border-[#254E58]/20
                       transition-all duration-300 font-['Montserrat']"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-[#F5F5F5] text-[#112D32] placeholder-[#254E58]/60 px-4 py-3 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-[#88BDBC] border border-[#254E58]/20
                       transition-all duration-300 font-['Montserrat']"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-[#F5F5F5] text-[#112D32] placeholder-[#254E58]/60 px-4 py-3 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-[#88BDBC] border border-[#254E58]/20
                       transition-all duration-300 font-['Montserrat']"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full bg-[#F5F5F5] text-[#112D32] placeholder-[#254E58]/60 px-4 py-3 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-[#88BDBC] border border-[#254E58]/20
                       transition-all duration-300 font-['Montserrat']"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#254E58] text-white py-3 rounded-lg font-['Righteous'] tracking-wide
                       hover:bg-[#112D32] transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              {loading ? <LoadingSpinner /> : "Sign Up"}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-[#112D32] font-['Montserrat']">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#254E58] font-['Righteous'] hover:text-[#88BDBC] ml-1
                       border-b border-[#254E58]/30 hover:border-[#88BDBC]
                       transition-all duration-300"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
