const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const path = require('path');

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

// ✅ Import Routes
const userRoutes = require('./routes/userRoutes');
const codeRoutes = require('./routes/codeRoutes');
const codeSubmissionRoutes = require('./routes/codeSubmissionRoutes');
const shareRoutes = require('./routes/shareRoutes');
const fileRoutes = require('./routes/fileRoutes');

// ✅ Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

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
  // Serve the index.html for all other routes (for client-side routing)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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