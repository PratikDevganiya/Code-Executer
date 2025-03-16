const mongoose = require('mongoose');

const codeSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  input: String,
  output: String,
  status: {
    type: String,
    enum: ['completed', 'error', 'runtime_error'],
    default: 'completed'
  },
  executionTime: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
codeSubmissionSchema.index({ user: 1, createdAt: -1 });
codeSubmissionSchema.index({ user: 1, language: 1 });
codeSubmissionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('CodeSubmission', codeSubmissionSchema);