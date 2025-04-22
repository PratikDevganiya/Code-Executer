const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const path = require('path');
const fs = require('fs');

// Load environment variables
require("dotenv").config();

// Debug mode flag - set to false to reduce console output
const DEBUG_MODE = false;
// Make DEBUG_MODE available globally
global.DEBUG_MODE = DEBUG_MODE;

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", process.env.CLIENT_URL || "*"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Track active rooms and users
const activeRooms = new Map(); // Map of roomId -> Set of socket IDs
const usernames = new Map(); // Map of socket ID -> username

// Socket.io connection handling
io.on("connection", (socket) => {
  let currentRoom = null;

  // Join a collaboration room
  socket.on("join-room", (data) => {
    const roomId = typeof data === 'object' ? data.roomId : data;
    const username = typeof data === 'object' ? data.username : 'Anonymous';
    
    if (DEBUG_MODE) {
      console.log(`User ${username} (${socket.id}) joining room: ${roomId}`);
    }
    
    // Store username for this socket
    usernames.set(socket.id, username);
    
    // Leave previous room if any
    if (currentRoom) {
      leaveRoom(socket, currentRoom);
    }
    
    // Join new room
    currentRoom = roomId;
    socket.join(roomId);
    
    // Add user to room tracking
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Map());
    }
    activeRooms.get(roomId).set(socket.id, username);
    
    // Emit join event to room with username
    socket.to(roomId).emit("user-joined", {
      userId: socket.id,
      username: username,
      timestamp: new Date()
    });
    
    // Send current user count and list of users to all users in the room
    const users = Array.from(activeRooms.get(roomId).entries()).map(([id, name]) => ({
      userId: id,
      username: name
    }));
    
    io.to(roomId).emit("user-list-update", {
      users: users,
      count: users.length
    });
  });

  // Handle code updates
  socket.on("code-update", (data) => {
    if (DEBUG_MODE) {
      console.log(`Code update from ${socket.id} in room ${data.roomId}`);
    }
    socket.to(data.roomId).emit("code-update", {
      code: data.code,
      userId: socket.id
    });
  });

  // Handle input updates
  socket.on("input-update", (data) => {
    if (DEBUG_MODE) {
      console.log(`Input update from ${socket.id} in room ${data.roomId}`);
    }
    socket.to(data.roomId).emit("input-update", {
      input: data.input,
      userId: socket.id
    });
  });

  // Handle output updates
  socket.on("output-update", (data) => {
    if (DEBUG_MODE) {
      console.log(`Output update from ${socket.id} in room ${data.roomId}`);
    }
    socket.to(data.roomId).emit("output-update", {
      output: data.output,
      userId: socket.id
    });
  });

  // Handle cursor movement
  socket.on("cursor-move", (data) => {
    socket.to(data.roomId).emit("cursor-update", {
      position: data.position,
      userId: socket.id,
      username: data.username
    });
  });

  // Handle chat messages
  socket.on("chat-message", (data) => {
    io.to(data.roomId).emit("new-message", {
      message: data.message,
      userId: socket.id,
      username: data.username,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (currentRoom) {
      leaveRoom(socket, currentRoom);
    }
  });
  
  // Handle explicit room leaving
  socket.on("leave-room", (data) => {
    const roomId = typeof data === 'object' ? data.roomId : data;
    if (roomId) {
      leaveRoom(socket, roomId);
      currentRoom = null;
    }
  });
  
  // Helper function to handle leaving a room
  function leaveRoom(socket, roomId) {
    socket.leave(roomId);
    
    // Remove user from room tracking
    if (activeRooms.has(roomId)) {
      activeRooms.get(roomId).delete(socket.id);
      
      // If room is empty, remove it from tracking
      if (activeRooms.get(roomId).size === 0) {
        activeRooms.delete(roomId);
      } else {
        // Get updated user list
        const users = Array.from(activeRooms.get(roomId).entries()).map(([id, name]) => ({
          userId: id,
          username: name
        }));
        
        // Notify remaining users about the updated count and user list
        io.to(roomId).emit("user-list-update", {
          users: users,
          count: users.length
        });
        
        // Notify about user leaving
        socket.to(roomId).emit("user-left", {
          userId: socket.id,
          username: usernames.get(socket.id) || 'Anonymous',
          timestamp: new Date()
        });
      }
    }
    
    // Clean up username mapping
    usernames.delete(socket.id);
  }
});

// ✅ Middleware (Order Matters)
app.use(express.json({ limit: '100mb' })); // Ensure JSON is parsed before routes
app.use(express.urlencoded({ extended: true, limit: '100mb'  }));

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3000",
  // Add your production domain
  process.env.CLIENT_URL || "*"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxBodySize: '100mb',
  })
);

// ✅ Debugging Middleware (Improved)
app.use((req, res, next) => {
  if (!req.url.startsWith("/api")) {
    // console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// Debug route to check file paths
app.get("/debug-paths", (req, res) => {
  try {
    // Check if public directory exists
    const publicDir = path.join(__dirname, 'public');
    const publicExists = fs.existsSync(publicDir);
    
    // Get public directory contents if it exists
    let publicContents = [];
    if (publicExists) {
      publicContents = fs.readdirSync(publicDir);
    }
    
    // Check if index.html exists
    const indexPath = path.join(publicDir, 'index.html');
    const indexExists = fs.existsSync(indexPath);
    
    // Check if test.html exists
    const testPath = path.join(publicDir, 'test.html');
    const testExists = fs.existsSync(testPath);
    
    // Get directory structure
    const paths = {
      currentDir: __dirname,
      workingDir: process.cwd(),
      publicDir: publicDir,
      publicExists: publicExists,
      indexHtmlPath: indexPath,
      indexHtmlExists: indexExists,
      testHtmlPath: testPath,
      testHtmlExists: testExists,
      publicContents: publicContents,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime() + ' seconds'
    };
    
    res.json(paths);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// ✅ Import Routes
const userRoutes = require('./routes/userRoutes');
const codeRoutes = require('./routes/codeRoutes');
const codeSubmissionRoutes = require('./routes/codeSubmissionRoutes');
const shareRoutes = require('./routes/shareRoutes');
const fileRoutes = require('./routes/fileRoutes');

// ✅ Serve static files from the public directory with improved options
console.log("Setting up static file serving from:", path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public'), {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['html', 'htm'],
  index: ['index.html'],
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
  }
}));

// Routes
app.use('/api/users', userRoutes); // This includes auth routes (login/register)
app.use('/api/code', codeRoutes);
app.use('/api/submissions', codeSubmissionRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/files', fileRoutes);

// ✅ Code Execution Routes
const { executeCode, getSupportedLanguages } = require("./utils/codeExecutor");

app.post("/execute", async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    await executeCode(req, res);
  } catch (err) {
    console.error("Execution Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/languages", getSupportedLanguages);

// ✅ Catch-all route to handle client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.url.startsWith('/api') || req.url.startsWith('/execute') || req.url.startsWith('/languages')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  // Log request information
  console.log('Received request for:', req.url);
  console.log('Current directory:', __dirname);
  console.log('Public path:', path.join(__dirname, 'public'));
  
  try {
    // Try to send test.html first as a test
    const testPath = path.join(__dirname, 'public', 'test.html');
    if (fs.existsSync(testPath)) {
      console.log('Serving test.html for debugging');
      return res.sendFile(testPath);
    }
    
    // Then try the index.html
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('Index.html exists, serving it');
      return res.sendFile(indexPath);
    }
    
    // If no index.html, create a dynamic one
    console.error('Index.html not found, sending dynamic response');
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CodeBoost - Static Files Missing</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .error { color: red; background: #ffeeee; padding: 10px; border-radius: 5px; }
            pre { background: #f5f5f5; padding: 10px; overflow: auto; }
          </style>
        </head>
        <body>
          <h1>CodeBoost</h1>
          <div class="error">
            <h2>Static Files Missing</h2>
            <p>The application's static files couldn't be found. This usually indicates a build process issue.</p>
          </div>
          <h3>Debugging Information:</h3>
          <pre>
            URL: ${req.url}
            Public Directory: ${path.join(__dirname, 'public')}
            Public Directory Exists: ${fs.existsSync(path.join(__dirname, 'public'))}
            Index Path: ${path.join(__dirname, 'public', 'index.html')}
            Index Exists: ${fs.existsSync(path.join(__dirname, 'public', 'index.html'))}
            Contents of Public: ${
              fs.existsSync(path.join(__dirname, 'public')) 
                ? fs.readdirSync(path.join(__dirname, 'public')).join(', ') 
                : 'Directory does not exist'
            }
          </pre>
          <p>Check the <a href="/debug-paths">/debug-paths</a> endpoint for more information.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error serving static content:', error);
    res.status(500).send('Server error: ' + error.message);
  }
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
  });
});