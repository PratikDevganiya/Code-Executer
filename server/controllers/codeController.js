const Submission = require("../models/Submission");
const { runCodeInDocker } = require("../services/codeExecutionService");

// @desc    Execute code
// @route   POST /api/code/execute
exports.executeCode = async (req, res) => {
  try {
    console.log("🔍 Incoming Request Body:", req.body); // ✅ Debugging

    const { code, language, input } = req.body || {}; // ✅ Prevent undefined destructuring

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    const output = await runCodeInDocker(code, language, input);
    
    return res.json({ message: "Execution successful", output });
  } catch (error) {
    console.error("Execution Error:", error);
    return res.status(500).json({ message: "Execution failed", error: error.message });
  }
};


// @desc    Get user submissions
// @route   GET /api/code/submissions
exports.getSubmissions = async (req, res) => {
  try {
    // ✅ Check Authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // ✅ Fetch submissions for the authenticated user
    const submissions = await Submission.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    return res.json(submissions);
  } catch (error) {
    console.error("Fetching Submissions Error:", error);
    return res.status(400).json({ message: error.message });
  }
};
