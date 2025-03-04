const Submission = require("../models/Submission");
const { runCodeInDocker } = require("../services/codeExecutionService");

// @desc    Execute code
// @route   POST /api/code/execute
exports.executeCode = async (req, res) => {
  try {

    const { code, language, input } = req.body || {}; // ✅ Prevent undefined destructuring

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    if (typeof code !== "string" || typeof language !== "string") {
      return res.status(400).json({ error: "Invalid input format" });
    }

    // ✅ Execute Code in Docker
    const output = await runCodeInDocker(code, language, input);

    if (!output) {
      return res.status(500).json({ message: "Execution failed. No output received." });
    }

    return res.json({ message: "Execution successful", output });
  } catch (error) {
    console.error("🚨 Execution Error:", error);
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

    // ✅ Fetch submissions for the authenticated user (optimized query)
    const submissions = await Submission.find({ user: req.user._id })
      .select("-__v") // Exclude MongoDB version field
      .sort({ createdAt: -1 })
      .lean(); // Optimize performance by returning plain JS objects

    if (!submissions.length) {
      return res.json({ message: "No submissions found" });
    }

    return res.json(submissions);
  } catch (error) {
    console.error("🚨 Fetching Submissions Error:", error);
    return res.status(400).json({ message: error.message });
  }
};
