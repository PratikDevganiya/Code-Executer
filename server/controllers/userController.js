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

    // ✅ Preserve existing values, update only what's provided
    let updateFields = {
      username: req.body.username || user.username,
      email: req.body.email || user.email,
      country: req.body.country || user.country,
      role: req.body.role || user.role,
      bio: req.body.bio?.trim() || user.bio,
    };

    // ✅ Ensure socialLinks is properly handled (avoid undefined issues)
    // Ensure we correctly extract socialLinks from frontend
    let socialLinks = req.body.socialLinks || user.socialLinks || {};

    socialLinks.github =
      socialLinks.github?.trim() || user.socialLinks.github || "";
    socialLinks.linkedin =
      socialLinks.linkedin?.trim() || user.socialLinks.linkedin || "";
    socialLinks.portfolio =
      socialLinks.portfolio?.trim() || user.socialLinks.portfolio || "";

    // Remove empty links
    Object.keys(socialLinks).forEach((key) => {
      if (!socialLinks[key]) delete socialLinks[key];
    });

    // ✅ Assign socialLinks back to the updateFields
    updateFields["socialLinks"] = socialLinks;

    // ✅ Ensure update happens only if there are changes
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // ✅ Send updated user back to frontend
    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update failed:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
