const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

// Load environment variables
require("dotenv").config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Track active rooms and users
const activeRooms = new Map(); // Map of roomId -> Set of socket IDs

// Socket.io connection handling
io.on("connection", (socket) => {
  let currentRoom = null;

  // Join a collaboration room
  socket.on("join-room", (roomId) => {
    // Leave previous room if any
    if (currentRoom) {
      leaveRoom(socket, currentRoom);
    }
    
    // Join new room
    currentRoom = roomId;
    socket.join(roomId);
    
    // Add user to room tracking
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    activeRooms.get(roomId).add(socket.id);
    
    // Emit join event to room
    socket.to(roomId).emit("user-joined", {
      userId: socket.id,
      timestamp: new Date()
    });
    
    // Send current user count to all users in the room
    io.to(roomId).emit("user-count-update", {
      count: activeRooms.get(roomId).size
    });
  });

  // Handle code changes
  socket.on("code-change", (data) => {
    socket.to(data.roomId).emit("code-update", {
      code: data.code,
      userId: socket.id,
      timestamp: new Date()
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
  socket.on("leave-room", (roomId) => {
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
        // Notify remaining users about the updated count
        io.to(roomId).emit("user-count-update", {
          count: activeRooms.get(roomId).size
        });
        
        // Notify about user leaving
        socket.to(roomId).emit("user-left", {
          userId: socket.id,
          timestamp: new Date()
        });
      }
    }
  }
});

// ✅ Middleware (Order Matters)
app.use(express.json({ limit: '100mb' })); // Ensure JSON is parsed before routes
app.use(express.urlencoded({ extended: true, limit: '100mb'  }));

// ✅ CORS Configuration
const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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
  if (!req.url.startsWith("/api") && !req.url.startsWith("/uploads")) {
    // console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

const path = require("path");

// ✅ Serve static files from "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Import Routes
const codeRoutes = require("./routes/codeRoutes");
const userRoutes = require("./routes/userRoutes");
const codeSubmissionRoutes = require('./routes/codeSubmissionRoutes');

// Routes
app.use('/api/users', userRoutes); // This includes auth routes (login/register)
app.use('/api/code', codeRoutes);
app.use('/api/submissions', codeSubmissionRoutes);

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