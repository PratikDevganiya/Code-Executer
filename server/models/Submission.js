const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    code: {
      type: String,
      required: [true, "Code is required"],
      trim: true,
    },
    language: {
      type: String,
      required: [true, "Programming language is required"],
      enum: [
        "JavaScript",
        "TypeScript",
        "Python",
        "Java",
        "C",
        "C++",
        "C#",
        "PHP",
        "Go",
        "Rust",
        "Swift",
        "Kotlin",
      ],
    },
    input: {
      type: String,
      default: "",
    },
    output: {
      type: String,
      required: true,
      default: "No Output",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "error", "timeout", "runtime_error"],
      default: "pending",
    },
    executionTime: {
      type: Number,
      required: true,
      default: 0,
    },
    isFinalSubmission: {
      type: Boolean,
      default: false, // false = normal execution, true = final submission
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
