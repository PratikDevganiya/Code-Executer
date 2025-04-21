const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['file', 'folder'],
    default: 'file'
  },
  content: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: function() {
      if (this.type === 'file') {
        // Determine language based on file extension
        const extension = this.name.split('.').pop().toLowerCase();
        const extensionMap = {
          'js': 'javascript',
          'jsx': 'javascript',
          'py': 'python',
          'java': 'java',
          'html': 'html',
          'css': 'css',
          'json': 'json',
          'c': 'c',
          'cpp': 'c++',
          'cs': 'c#',
          'php': 'php',
          'go': 'go',
          'rs': 'rust',
          'rb': 'ruby'
        };
        return extensionMap[extension] || 'plaintext';
      }
      return undefined;
    }
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  path: {
    type: String,
    default: '/'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for frequently queried fields
fileSchema.index({ user: 1, parentId: 1, isDeleted: 1 });
fileSchema.index({ user: 1, isDeleted: 1 });

// Virtual for children (used for building tree structure)
fileSchema.virtual('children', {
  ref: 'File',
  localField: '_id',
  foreignField: 'parentId',
  match: { isDeleted: false }
});

const File = mongoose.model('File', fileSchema);

module.exports = File; 