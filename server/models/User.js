const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    // 🔹 Profile Image (Updated for Base64 Support)
    profileImage: {
      type: String,
      default: "",
      validate: {
        validator: function (value) {
          return (
            /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(value) || // Base64 images 
            /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i.test(value) || // URLs
            /^\/uploads\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i.test(value) || // Legacy local paths
            value === "" || // Empty string
            value === "/default-avatar.svg" // Default avatar
          );
        },
        message: "Invalid image format",
      },
    },
    country: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "Student", "Developer", "Designer", "Engineer", "Manager", "Other"], // ✅ Add all roles here
      default: "user",
    },    
    // 🔹 Social Links
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },
    // Reset password fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verificationToken: String,
    submissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CodeSubmission",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only if modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Method to generate email verification token
userSchema.methods.getVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.verificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  return verificationToken;
};

module.exports = mongoose.model("User", userSchema);
