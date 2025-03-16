const axios = require('axios');
const Submission = require("../models/Submission");
const { runCode } = require("../services/codeExecutionService");
const Collaboration = require('../models/Collaboration');
const asyncHandler = require('express-async-handler');

// @desc    Execute code
// @route   POST /api/code/execute
const executeCode = asyncHandler(async (req, res) => {
  try {
    console.log("🚀 Received execution request:", req.body);
    const { code, language, input } = req.body || {};

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

    // ✅ Execute Code using Judge0
    const result = await runCode(code, language, input);
    console.log("📝 Code Execution Result:", result);

    if (!result) {
      console.error("❌ Execution failed. No result received.");
      return res.status(500).json({ message: "Execution failed. No result received." });
    }

    // ✅ Calculate total time (including API latency)
    const totalTime = Date.now() - startTime;

    // ✅ Ensure req.user exists
    if (!req.user || !req.user._id) {
      console.error("❌ Error: req.user._id is undefined");
      return res.status(401).json({ error: "User not authenticated" });
    }

    // ✅ Save submission to database
    let newSubmission;
    try {
      console.log("📝 Saving submission to database...");
      newSubmission = await Submission.create({
        user: req.user._id,
        code,
        language,
        input,
        output: result.output,
        status: result.status,
        executionTime: result.executionTime || totalTime
      });

      console.log("✅ Submission Successfully Saved:", JSON.stringify(newSubmission, null, 2));
    } catch (dbError) {
      console.error("❌ Error Saving Submission:", dbError);
      return res.status(500).json({ error: "Failed to save submission in database" });
    }

    return res.json({
      message: result.message,
      output: result.output,
      status: result.status,
      executionTime: result.executionTime || totalTime,
      submissionId: newSubmission._id
    });
  } catch (error) {
    console.error("🚨 Execution Error:", error);
    return res.status(500).json({ message: "Execution failed", error: error.message });
  }
});

// @desc    Get user submissions
// @route   GET /api/code/submissions
const getSubmissions = asyncHandler(async (req, res) => {
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
});

// Save code submission
const saveSubmission = asyncHandler(async (req, res) => {
  const { code, language, input, output } = req.body;
  const userId = req.user.id;

  if (!code || !language) {
    return res.status(400).json({ message: "Code and language are required" });
  }

  try {
    const submission = await Submission.create({
      user: userId,
      code,
      language,
      input,
      output
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ message: "Failed to save submission", error: error.message });
  }
});

// Get submission by ID
const getSubmissionById = asyncHandler(async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Check if the submission belongs to the user
    if (submission.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this submission" });
    }

    res.status(200).json(submission);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch submission", error: error.message });
  }
});

// Delete submission
const deleteSubmission = asyncHandler(async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Check if the submission belongs to the user
    if (submission.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this submission" });
    }

    await submission.remove();
    res.status(200).json({ message: "Submission deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Failed to delete submission", error: error.message });
  }
});

// Get user's collaborations (limited to 50, sorted by most recent)
const getUserCollaborations = async (req, res) => {
  try {
    const collaborations = await Collaboration.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(collaborations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching collaborations", error: error.message });
  }
};

// Save new collaboration (maintain limit of 50)
const saveCollaboration = async (req, res) => {
  try {
    const { roomId, code, language, documentName, editor, timestamp } = req.body;

    if (!roomId || !code || !language || !editor) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        required: ["roomId", "code", "language", "editor"] 
      });
    }

    // Check if collaboration with this roomId already exists
    let collaboration = await Collaboration.findOne({
      roomId,
      user: req.user._id
    });

    if (collaboration) {
      // Update existing collaboration
      collaboration.code = code;
      collaboration.language = language;
      collaboration.documentName = documentName;
      collaboration.editor = editor;
      collaboration.timestamp = timestamp || new Date();
      await collaboration.save();
      
      return res.status(200).json(collaboration);
    }

    // If not exists, check count and potentially delete oldest
    const count = await Collaboration.countDocuments({ user: req.user._id });

    if (count >= 50) {
      const oldest = await Collaboration.findOne({ user: req.user._id })
        .sort({ createdAt: 1 });
      if (oldest) {
        await Collaboration.deleteOne({ _id: oldest._id });
      }
    }

    // Create new collaboration
    collaboration = await Collaboration.create({
      user: req.user._id,
      roomId,
      code,
      language,
      documentName,
      editor,
      timestamp: timestamp || new Date()
    });

    res.status(201).json(collaboration);
  } catch (error) {
    console.error("Error saving collaboration:", error);
    res.status(500).json({ 
      message: "Error saving collaboration", 
      error: error.message 
    });
  }
};

// Get specific collaboration by roomId
const getCollaborationByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const collaboration = await Collaboration.findOne({
      roomId,
      user: req.user._id
    }).lean();

    if (!collaboration) {
      return res.status(404).json({ message: "Collaboration not found" });
    }

    res.json(collaboration);
  } catch (error) {
    res.status(500).json({ message: "Error fetching collaboration", error: error.message });
  }
};

// Delete collaboration
const deleteCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the collaboration first to verify ownership
    const collaboration = await Collaboration.findOne({
      _id: id,
      user: req.user._id
    });

    if (!collaboration) {
      return res.status(404).json({ success: false, message: "Collaboration not found" });
    }

    // Use deleteOne instead of remove (which is deprecated)
    await Collaboration.deleteOne({ _id: id });
    
    // Return success response
    res.json({ success: true, message: "Collaboration deleted successfully" });
  } catch (error) {
    console.error("Error deleting collaboration:", error);
    res.status(500).json({ success: false, message: "Error deleting collaboration", error: error.message });
  }
};

module.exports = {
  executeCode,
  saveSubmission,
  getUserSubmissions: getSubmissions,
  getSubmissionById,
  deleteSubmission,
  saveCollaboration,
  getUserCollaborations,
  getCollaborationByRoomId,
  deleteCollaboration
};
