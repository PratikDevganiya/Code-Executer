const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { executeCode, getSubmissions } = require("../controllers/codeController");
const CollaborationModel = require("../models/Collaboration"); // ✅ Import Model

// ✅ Middleware for CORS handling
router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // ✅ Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// ✅ Route for code execution
router.post("/execute", protect , async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Code and language are required" });
    }

    // ✅ Execute the code
    await executeCode(req, res);
  } catch (error) {
    console.error("Execution Error:", error);
    res.status(500).json({ message: "Execution failed", error: error.message });
  }
});

// ✅ Route for fetching submissions (with authentication)
router.get("/submissions", protect, getSubmissions);

// ✅ Route for fetching collaborations (with authentication check)
router.get("/collaborations", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const collaborations = await CollaborationModel.find();
    res.json({ success: true, collaborations });
  } catch (error) {
    console.error("Error fetching collaborations:", error);
    res.status(500).json({ message: "Error fetching collaborations" });
  }
});

module.exports = router;
