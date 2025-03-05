import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaGlobe,
  FaGraduationCap,
  FaEdit,
  FaSave,
  FaGithub,
  FaLinkedin,
  FaLink,
  FaImage,
} from "react-icons/fa";
import axios from "axios";

const UserDetails = ({ user, updateUser }) => {
  if (!user) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    country: user.country || "India",
    role: user.role || "Other",
    bio: user.bio || "",
    profileImage: user.profileImage || "/default-avatar.svg",
    socialLinks: {
      github: user.socialLinks?.github || "",
      linkedin: user.socialLinks?.linkedin || "",
      portfolio: user.socialLinks?.portfolio || "",
    },
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const countries = [
    "India",
    "USA",
    "UK",
    "Canada",
    "Germany",
    "France",
    "Australia",
  ];
  const roles = [
    "Student",
    "Developer",
    "Designer",
    "Engineer",
    "Manager",
    "Other",
  ];

  // Handle Profile Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // Handle input change (including socialLinks)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["github", "linkedin", "portfolio"].includes(name)) {
      // ✅ Define updatedSocialLinks before using it
      const updatedSocialLinks = { ...formData.socialLinks, [name]: value };

      setFormData((prev) => ({
        ...prev,
        socialLinks: updatedSocialLinks,
      }));

      console.log("Updated Social Links on Input Change:", updatedSocialLinks);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Save Updated Data
  const handleSave = async () => {
    try {
      console.log("Updated Social Links Before Sending:", formData.socialLinks);

      // ✅ Prepare the updated data payload
      const updatedData = {
        username: formData.username,
        email: formData.email,
        country: formData.country,
        role: formData.role,
        bio: formData.bio,
        socialLinks: formData.socialLinks, // ✅ Ensure correct structure
      };

      // ✅ Handle profile image separately if selected
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append("profileImage", selectedImage);

        // ✅ Upload the image and get the URL
        const imageUploadRes = await axios.put(
          "http://localhost:5001/api/users/update",
          imageFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }
        );

        // console.log("Image Upload Response:", imageUploadRes.data);

        // ✅ Ensure the backend returns a valid profileImage URL
        if (imageUploadRes.data && imageUploadRes.data.profileImage) {
          updatedData.profileImage = imageUploadRes.data.profileImage;
        }
      }

      // ✅ Now send the entire user data update request
      const res = await axios.put(
        "http://localhost:5001/api/users/update",
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      // console.log("Updated User Data After Save:", res.data);

      updateUser(res.data); // ✅ Ensure UI updates with latest data
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  return (
    <div
      className="bg-gradient-to-r from-[#fcfcfc] to-[#f9f9f9] p-8 rounded-xl shadow-sm w-full max-w-lg mx-auto text-gray-900 min-h-[500px] flex flex-col items-center border border-gray-100"
      style={{ fontFamily: "Righteous, sans-serif" }}
    >
      {/* Profile Image */}
      <div className="relative w-32 h-32 rounded-full border-2 border-gray-300 shadow-sm overflow-hidden">
        <img
          src={
            formData.profileImage.startsWith("/uploads/")
              ? `http://localhost:5001${formData.profileImage}`
              : formData.profileImage
          }
          alt="Profile"
          className="w-full h-full object-cover"
        />

        {isEditing && (
          <label className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 text-white text-sm text-center cursor-pointer">
            <FaImage className="inline-block mr-1" /> Change
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* User Info Section */}
      <div className="mt-6 w-full text-left space-y-3">
        <div className="flex items-center gap-2">
          <FaUser className="text-gray-500" />
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          ) : (
            <span>{formData.username}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FaEnvelope className="text-gray-500" />
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          ) : (
            <span>{formData.email}</span>
          )}
        </div>

        {/* Country & Role Selection */}
        <div className="flex items-center gap-2">
          <FaGlobe className="text-gray-500" />
          {isEditing ? (
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          ) : (
            <span>{formData.country}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FaGraduationCap className="text-gray-500" />
          {isEditing ? (
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          ) : (
            <span>{formData.role}</span>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="mt-6 w-full">
        <h3 className="text-md text-gray-800 font-semibold">Social Links</h3>
        {isEditing ? (
          <div className="space-y-2">
            {Object.entries(formData.socialLinks).map(([key, value]) => (
              <input
                key={key}
                type="text"
                name={key}
                value={value}
                onChange={handleChange}
                placeholder={`${
                  key.charAt(0).toUpperCase() + key.slice(1)
                } URL`}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-2 mt-2">
            {Object.entries(formData.socialLinks).map(([key, value]) =>
              value ? (
                <a
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700"
                >
                  {key === "github" ? (
                    <FaGithub />
                  ) : key === "linkedin" ? (
                    <FaLinkedin />
                  ) : (
                    <FaLink />
                  )}{" "}
                  {key}
                </a>
              ) : null
            )}
          </div>
        )}
      </div>

      <button
        className="mt-6 px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-2"
        onClick={isEditing ? handleSave : () => setIsEditing(true)}
      >
        {isEditing ? <FaSave /> : <FaEdit />}
        {isEditing ? "Save Profile" : "Edit Profile"}
      </button>
    </div>
  );
};

export default UserDetails;
