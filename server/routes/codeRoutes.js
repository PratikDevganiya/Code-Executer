const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { executeCode, getSubmissions } = require("../controllers/codeController");

// ✅ Properly define the route
router.post("/execute", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Code and language are required" });
    }

    // ✅ Call executeCode function directly
    await executeCode(req, res);
  } catch (error) {
    console.error("Execution Error:", error);
    res.status(500).json({ message: "Execution failed", error: error.message });
  }
});

router.get("/submissions", protect, getSubmissions);

module.exports = router;