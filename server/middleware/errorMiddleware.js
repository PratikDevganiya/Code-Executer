// Handle 404 errors
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  // Custom error handler
  const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
      errors: err.errors || undefined
    });
  };
  
  // Mongoose error handler
  const mongooseErrors = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        message: 'Validation Error',
        errors: messages
      });
    }
  
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        message: `Duplicate ${field} entered`,
        errors: [`${field} already exists`]
      });
    }
  
    next(err);
  };
  
  module.exports = {
    notFound,
    errorHandler,
    mongooseErrors
  };