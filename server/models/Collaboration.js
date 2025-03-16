const mongoose = require('mongoose');

const collaborationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    roomId: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      default: 'javascript'
    },
    documentName: {
      type: String,
      default: 'Untitled Document'
    },
    editor: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Collaboration', collaborationSchema);
