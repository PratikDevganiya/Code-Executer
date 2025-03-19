const multer = require('multer');

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter (allow only images)
const fileFilter = (req, file, cb) => {
  const allowedMimetypes = /^image\/(jpeg|png|gif|jpg|webp)$/;
  
  if (allowedMimetypes.test(file.mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, GIF and WebP image files are allowed!'));
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 2 * 1024 * 1024, // 2MB limit for base64 storage
    files: 1 // Only allow 1 file at a time
  },
  fileFilter: fileFilter
});

module.exports = upload;
