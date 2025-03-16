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
      className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mx-auto text-[#112D32] min-h-[500px] flex flex-col items-center border-l-4 border-[#88BDBC] relative overflow-hidden transition-all duration-300 hover:shadow-xl"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-[#88BDBC]/5 rounded-full"></div>
      
      {/* Profile Image */}
      <div className="relative w-32 h-32 rounded-full border-2 border-[#88BDBC]/40 shadow-lg overflow-hidden z-10">
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
          <label className="absolute bottom-0 left-0 right-0 bg-[#254E58]/80 text-white text-sm text-center cursor-pointer">
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
      <div className="mt-6 w-full text-left space-y-3 relative z-10">
        <div className="flex items-center gap-2">
          <FaUser className="text-[#88BDBC]" />
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="border border-[#88BDBC]/30 bg-white rounded-md p-2 w-full text-[#112D32] focus:outline-none focus:ring-2 focus:ring-[#88BDBC]/60 font-['Montserrat']"
            />
          ) : (
            <span className="font-['Montserrat'] text-[#254E58]">{formData.username}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FaEnvelope className="text-[#88BDBC]" />
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-[#88BDBC]/30 bg-white rounded-md p-2 w-full text-[#112D32] focus:outline-none focus:ring-2 focus:ring-[#88BDBC]/60 font-['Montserrat']"
            />
          ) : (
            <span className="font-['Montserrat'] text-[#254E58]">{formData.email}</span>
          )}
        </div>

        {/* Country & Role Selection */}
        <div className="flex items-center gap-2">
          <FaGlobe className="text-[#88BDBC]" />
          {isEditing ? (
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="border border-[#88BDBC]/30 bg-white rounded-md p-2 w-full text-[#112D32] focus:outline-none focus:ring-2 focus:ring-[#88BDBC]/60 font-['Montserrat']"
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-['Montserrat'] text-[#254E58]">{formData.country}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FaGraduationCap className="text-[#88BDBC]" />
          {isEditing ? (
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border border-[#88BDBC]/30 bg-white rounded-md p-2 w-full text-[#112D32] focus:outline-none focus:ring-2 focus:ring-[#88BDBC]/60 font-['Montserrat']"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-['Montserrat'] text-[#254E58]">{formData.role}</span>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="mt-6 w-full relative z-10">
        <h3 className="text-md text-[#254E58] font-semibold font-['Righteous']">Social Links</h3>

        {isEditing ? (
          <div className="space-y-2">
            {Object.entries(formData.socialLinks).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                {key === "github" && <FaGithub className="text-[#88BDBC]" />}
                {key === "linkedin" && <FaLinkedin className="text-[#88BDBC]" />}
                {key === "portfolio" && <FaLink className="text-[#88BDBC]" />}

                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={handleChange}
                  placeholder={`${
                    key.charAt(0).toUpperCase() + key.slice(1)
                  } URL`}
                  className="border border-[#88BDBC]/30 bg-white rounded-md p-2 w-full text-[#112D32] focus:outline-none focus:ring-2 focus:ring-[#88BDBC]/60 font-['Montserrat']"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-2">
            {formData.socialLinks.github && (
              <a
                href={formData.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2 rounded-full bg-gradient-to-br from-white to-[#F5F5F5] border border-[#88BDBC]/40 hover:border-[#88BDBC] shadow-sm hover:shadow-md transition-all duration-200"
              >
                <FaGithub className="text-[#333333] text-xl group-hover:text-[#24292e] transition-colors duration-200" />
              </a>
            )}
            {formData.socialLinks.linkedin && (
              <a
                href={formData.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2 rounded-full bg-gradient-to-br from-white to-[#F5F5F5] border border-[#88BDBC]/40 hover:border-[#88BDBC] shadow-sm hover:shadow-md transition-all duration-200"
              >
                <FaLinkedin className="text-[#0077B5] text-xl group-hover:text-[#0A66C2] transition-colors duration-200" />
              </a>
            )}
            {formData.socialLinks.portfolio && (
              <a
                href={formData.socialLinks.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2 rounded-full bg-gradient-to-br from-white to-[#F5F5F5] border border-[#88BDBC]/40 hover:border-[#88BDBC] shadow-sm hover:shadow-md transition-all duration-200"
              >
                <FaLink className="text-[#254E58] text-xl group-hover:text-[#88BDBC] transition-colors duration-200" />
              </a>
            )}
          </div>
        )}
      </div>

      <button
        className="mt-6 px-6 py-2 rounded-lg bg-[#88BDBC] text-white hover:bg-[#254E58] transition-all flex items-center gap-2 font-medium z-10"
        onClick={isEditing ? handleSave : () => setIsEditing(true)}
      >
        {isEditing ? <FaSave /> : <FaEdit />}
        {isEditing ? "Save Profile" : "Edit Profile"}
      </button>
    </div>
  );
};

export default UserDetails;
