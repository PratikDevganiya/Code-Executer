const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
require("dotenv").config({ path: "./server/.env" });

// Connect to Database
connectDB();

const app = express();

// ✅ Middleware (Order Matters)
app.use(express.json()); // Ensure JSON is parsed before routes
app.use(express.urlencoded({ extended: true }));

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
  })
);

// ✅ Debugging Middleware (Improved)
app.use((req, res, next) => {
  next();
});

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// ✅ Import Routes
const codeRoutes = require("./routes/codeRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/code", codeRoutes);
app.use("/api/users", userRoutes);

// ✅ Code Execution Route
const { executeCode } = require("./utils/codeExecutor"); // Import execution function

app.post("/execute", async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    // Call execution logic here with req and res
    await executeCode(req, res); // Pass req and res instead of code, language, and input directly
  } catch (err) {
    console.error("Execution Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
  });
});
