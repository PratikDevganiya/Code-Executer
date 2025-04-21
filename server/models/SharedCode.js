const mongoose = require('mongoose');

const sharedCodeSchema = new mongoose.Schema({
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
    required: true
  },
  input: {
    type: String,
    default: ""
  },
  output: {
    type: String,
    default: "No Output"
  },
  shareId: {
    type: String,
    required: true,
    unique: true
  },
  views: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24*60*60*1000) // Default to 24 hours for safety
  },
  expirationPeriod: {
    type: String,
    enum: ['1h', '24h', '7d', '30d', '90d', 'never'],
    default: '24h'
  }
}, { timestamps: true });

// Before saving, set the expiresAt date based on expirationPeriod
sharedCodeSchema.pre('save', function(next) {
  const now = new Date();
  
  switch(this.expirationPeriod) {
    case '1h':
      this.expiresAt = new Date(+now + 60*60*1000); // 1 hour
      break;
    case '24h':
      this.expiresAt = new Date(+now + 24*60*60*1000); // 24 hours
      break;
    case '7d':
      this.expiresAt = new Date(+now + 7*24*60*60*1000); // 7 days
      break;
    case '30d':
      this.expiresAt = new Date(+now + 30*24*60*60*1000); // 30 days
      break;
    case '90d':
      this.expiresAt = new Date(+now + 90*24*60*60*1000); // 90 days
      break;
    case 'never':
      this.expiresAt = new Date(+now + 365*24*60*60*1000); // Set to 1 year as MongoDB requires a date
      break;
    default:
      this.expiresAt = new Date(+now + 24*60*60*1000); // Default to 24 hours
  }
  
  next();
});

// Index for faster lookups
sharedCodeSchema.index({ shareId: 1 });
sharedCodeSchema.index({ user: 1, createdAt: -1 });
sharedCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Helper to get remaining time
sharedCodeSchema.methods.getRemainingTime = function() {
  const now = new Date();
  const remainingMs = this.expiresAt - now;
  
  if (remainingMs <= 0) return 'Expired';
  
  const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

module.exports = mongoose.model('SharedCode', sharedCodeSchema);