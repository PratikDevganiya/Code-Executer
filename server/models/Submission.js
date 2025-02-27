const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  input: String,
  output: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'error'],
    default: 'pending',
  },
  executionTime: Number,
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);