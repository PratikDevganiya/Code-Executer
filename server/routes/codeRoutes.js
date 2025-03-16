const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const codeController = require("../controllers/codeController");
const CollaborationModel = require("../models/Collaboration"); // ✅ Import Model
const { getAvailableLanguages, getInstallInstructions } = require("../utils/languageSetup");

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
router.post("/execute", protect, codeController.executeCode);

// ✅ Route for fetching submissions (with authentication)
router.get("/submissions", protect, codeController.getUserSubmissions);
router.get("/submissions/:id", protect, codeController.getSubmissionById);
router.post("/submissions", protect, codeController.saveSubmission);
router.delete("/submissions/:id", protect, codeController.deleteSubmission);

// ✅ Route for fetching collaborations (with authentication check)
router.get("/collaborations", protect, codeController.getUserCollaborations);
router.post("/collaborations", protect, codeController.saveCollaboration);
router.get("/collaborations/:roomId", protect, codeController.getCollaborationByRoomId);
router.delete("/collaborations/:id", protect, codeController.deleteCollaboration);

// ✅ Route to check available languages
router.get("/languages", async (req, res) => {
  try {
    const availableLanguages = getAvailableLanguages();
    res.json({ languages: availableLanguages });
  } catch (error) {
    console.error("Error checking languages:", error);
    res.status(500).json({ message: "Failed to check available languages", error: error.message });
  }
});

// ✅ Route to get installation instructions for a specific language
router.get("/languages/:language/install", protect, async (req, res) => {
  try {
    const { language } = req.params;
    const instructions = getInstallInstructions(language);
    
    if (typeof instructions === 'string') {
      return res.status(404).json({ error: instructions });
    }
    
    res.json(instructions);
  } catch (error) {
    console.error("Error getting installation instructions:", error);
    res.status(500).json({ error: "Failed to get installation instructions" });
  }
});

module.exports = router;
