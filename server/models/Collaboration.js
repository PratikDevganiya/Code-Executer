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
    participants: {
      type: [String],
      default: []
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

// Remove all existing indexes first
// This is a more aggressive approach to ensure we start fresh
collaborationSchema.pre('save', async function(next) {
  try {
    // Only run this once per application startup
    if (!mongoose.models.Collaboration.indexesFixed) {
      console.log('Fixing Collaboration indexes...');
      
      // Check if collection exists
      const collections = await mongoose.connection.db.listCollections({ name: 'collaborations' }).toArray();
      if (collections.length > 0) {
        // Get all indexes
        const indexes = await mongoose.connection.db.collection('collaborations').indexes();
        
        // Drop all indexes except _id
        for (const index of indexes) {
          if (index.name !== '_id_') {
            console.log(`Dropping index: ${index.name}`);
            await mongoose.connection.db.collection('collaborations').dropIndex(index.name);
          }
        }
        
        // Mark as fixed
        mongoose.models.Collaboration.indexesFixed = true;
      }
    }
    next();
  } catch (error) {
    console.error('Error fixing indexes:', error);
    next();
  }
});

// Create a compound index on user and roomId
// This ensures each user can only have one entry per roomId
// but different users can save the same roomId
collaborationSchema.index({ user: 1, roomId: 1 }, { unique: true });

module.exports = mongoose.model('Collaboration', collaborationSchema);
