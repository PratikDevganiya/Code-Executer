const mongoose = require('mongoose');

const codeSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    enum: [
      "JavaScript", "javascript",
      "TypeScript", "typescript",
      "Python", "python",
      "Java", "java",
      "C", "c",
      "C++", "c++",
      "C#", "c#",
      "PHP", "php",
      "Go", "go",
      "Rust", "rust",
      "Swift", "swift",
      "Kotlin", "kotlin"
    ]
  },
  input: {
    type: String,
    default: ""
  },
  output: {
    type: String,
    default: "No Output"
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'error', 'timeout', 'runtime_error'],
    default: 'completed'
  },
  executionTime: {
    type: Number,
    default: 0
  },
  isFinalSubmission: {
    type: Boolean,
    default: false // false = normal execution, true = final submission
  }
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

// Index for faster queries
codeSubmissionSchema.index({ user: 1, createdAt: -1 });
codeSubmissionSchema.index({ user: 1, language: 1 });
codeSubmissionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('CodeSubmission', codeSubmissionSchema);