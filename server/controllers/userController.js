const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register user
// @route   POST /api/users/register
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Login user
// @route   POST /api/users/login
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        country: user.country,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Preserve existing values, update only provided ones
    let updateFields = {
      username: req.body.username !== undefined ? req.body.username.trim() : user.username,
      email: req.body.email || user.email,
      country: req.body.country || user.country,
      role: req.body.role || user.role,
      bio: req.body.bio !== undefined ? req.body.bio.trim() : user.bio, // Allow empty but not undefined
    };

    // ✅ Ensure socialLinks is properly handled
    let socialLinks = {};

    if (req.body.socialLinks) {
      try {
        // ✅ Parse socialLinks safely
        socialLinks =
          typeof req.body.socialLinks === "string"
            ? JSON.parse(req.body.socialLinks)
            : req.body.socialLinks;
      } catch (error) {
        console.error("❌ Error parsing socialLinks:", error);
        return res.status(400).json({ message: "Invalid socialLinks format" });
      }
    }

    // ✅ Construct cleaned socialLinks object (Remove empty fields)
    const updatedSocialLinks = {};
    ["github", "linkedin", "portfolio"].forEach((key) => {
      if (socialLinks[key] && socialLinks[key].trim()) {
        updatedSocialLinks[key] = socialLinks[key].trim();
      }
    });

    let updateQuery = { $set: updateFields };
    let unsetQuery = {};

    // ✅ If `updatedSocialLinks` has values, update them; otherwise, remove socialLinks
    if (Object.keys(updatedSocialLinks).length > 0) {
      updateQuery["$set"]["socialLinks"] = updatedSocialLinks;
    } else {
      unsetQuery["socialLinks"] = 1;
    }

    // ✅ Handle profile image update - NEW BASE64 APPROACH
    if (req.file) {
      // Convert the buffer to base64 string
      const base64Image = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      updateQuery["$set"]["profileImage"] = `data:${mimeType};base64,${base64Image}`;
    } else if (req.body.profileImage && req.body.profileImage.startsWith('data:image')) {
      // If client sent a base64 image directly
      updateQuery["$set"]["profileImage"] = req.body.profileImage;
    }

    // ✅ Final MongoDB update operation
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...updateQuery,
        ...(Object.keys(unsetQuery).length > 0 ? { $unset: unsetQuery } : {}), // Only include $unset if needed
      },
      { new: true, runValidators: true }
    );

    // ✅ Send updated user back to frontend
    res.json(updatedUser);
  } catch (error) {
    console.error("❌ Profile update failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
