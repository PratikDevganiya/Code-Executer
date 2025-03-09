const Submission = require("../models/Submission");
const { runCodeInDocker } = require("../services/codeExecutionService");


// @desc    Execute code
// @route   POST /api/code/execute
exports.executeCode = async (req, res) => {
  try {
    console.log("🚀 Received execution request:", req.body);
    const { code, language, input } = req.body || {}; // ✅ Prevent undefined destructuring

    if (!code || !language) {
      console.error("❌ Missing Code or Language");
      return res.status(400).json({ error: "Code and language are required" });
    }

    if (typeof code !== "string" || typeof language !== "string") {
      console.error("❌ Invalid Code/Language Format");
      return res.status(400).json({ error: "Invalid input format" });
    }

    // ✅ Start execution time measurement
    const startTime = Date.now();

    // ✅ Execute Code in Docker
    let output;
    try {
      output = await runCodeInDocker(code, language, input);
      console.log("📝 Code Execution Output:", output);
    } catch (dockerError) {
      console.error("🚨 Docker Execution Error:", dockerError);
      return res.status(500).json({ error: "Code execution failed in Docker" });
    }

    if (!output) {
      console.error("❌ Execution failed. No output received.");
      return res
        .status(500)
        .json({ message: "Execution failed. No output received." });
    }

    // ✅ Calculate execution time
    const executionTime = Date.now() - startTime;

    // ✅ Ensure req.user exists
    if (!req.user || !req.user._id) {
      console.error("❌ Error: req.user._id is undefined");
      return res.status(401).json({ error: "User not authenticated" });
    }

    // ✅ Convert output to string to avoid saving issues
    const outputString = output ? output.toString().trim() : "No Output";

    console.log("🛠 Creating Submission:", {
      user: req.user._id,
      code,
      language,
      input,
      output: outputString,
      status: "completed",
      executionTime,
    });

    console.log("🛠 Preparing to Save Submission...");
    console.log("User ID:", req.user._id);
    console.log("Code to Save:", code);
    console.log("Language:", language);

    // ✅ Save submission to database
    let newSubmission;
    try {
      console.log("📝 Saving submission to database..."); // Log before saving
      newSubmission = await Submission.create({
        user: req.user._id,
        code,
        language,
        input,
        output: outputString,
        status: "completed", // Matches schema enum
        executionTime,
      });

      console.log(
        "✅ Submission Successfully Saved:",
        JSON.stringify(newSubmission, null, 2)
      );

      // 🔍 Check if it's actually saved in DB
      const savedSubmission = await Submission.findById(newSubmission._id);
      if (!savedSubmission) {
        console.error("❌ Submission not found in DB after insert!");
      } else {
        console.log(
          "🔍 Confirmed Submission in DB:",
          JSON.stringify(savedSubmission, null, 2)
        );
      }
    } catch (dbError) {
      console.error("❌ Error Saving Submission:", dbError);
      return res
        .status(500)
        .json({ error: "Failed to save submission in database" });
    }

    return res.json({
      message: "Execution successful",
      output: outputString,
      executionTime,
      submissionId: newSubmission._id,
    });
  } catch (error) {
    console.error("🚨 Execution Error:", error);
    return res
      .status(500)
      .json({ message: "Execution failed", error: error.message });
  }
};

// @desc    Get user submissions
// @route   GET /api/code/submissions
exports.getSubmissions = async (req, res) => {
  try {
    console.log("🔍 Checking req.user:", req.user); // Debugging Line

    // ✅ Check Authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // ✅ Fetch submissions for the authenticated user (optimized query)
    const submissions = await Submission.find({ user: req.user._id })
      .select("-__v") // Exclude MongoDB version field
      .sort({ createdAt: -1 })
      .lean(); // Optimize performance by returning plain JS objects

    console.log("📜 Retrieved Submissions:", submissions);

    if (!submissions.length) {
      return res.json({ message: "No submissions found" });
    }

    return res.json(submissions);
  } catch (error) {
    console.error("🚨 Fetching Submissions Error:", error);
    return res.status(400).json({ message: error.message });
  }
};
