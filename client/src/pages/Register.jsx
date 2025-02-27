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
      navigate("/editor");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EBE5C2] font-['Poppins'] px-4">
      {/* Glassmorphic Register Card */}
      <div className="max-w-md w-full p-8 bg-[#F5F2E3] backdrop-blur-md rounded-xl shadow-2xl border border-[#8B8558]/30">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#3B3B3B] font-['Righteous']">
            Create Account
          </h2>
          <p className="text-[#5A5A5A] mt-2 font-['Inter']">
            Join us and start coding today!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-center mt-4 shadow-md">
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
              className="w-full bg-[#E6D4A4] text-[#3B3B3B] placeholder-[#5A5A5A] px-4 py-3 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#8B8558] transition-all duration-300"
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
              className="w-full bg-[#E6D4A4] text-[#3B3B3B] placeholder-[#5A5A5A] px-4 py-3 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#8B8558] transition-all duration-300"
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
              className="w-full bg-[#E6D4A4] text-[#3B3B3B] placeholder-[#5A5A5A] px-4 py-3 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#8B8558] transition-all duration-300"
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
              className="w-full bg-[#E6D4A4] text-[#3B3B3B] placeholder-[#5A5A5A] px-4 py-3 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#8B8558] transition-all duration-300"
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
              className="w-full bg-[#8B8558] text-[#F5F2E3] py-3 rounded-lg font-semibold 
                         hover:bg-[#6B6343] transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              {loading ? <LoadingSpinner /> : "Sign Up"}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-[#5A5A5A]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#8B8558] font-semibold underline 
                         hover:text-[#6B6343] hover:scale-105 transition-all duration-300 
                         hover:shadow-[0_0_8px_rgba(139,133,88,0.7)] px-1"
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
