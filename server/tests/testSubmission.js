const mongoose = require("mongoose");
const Submission = require("../models/Submission"); // Ensure correct path
require("dotenv").config({ path: require("path").join(__dirname, "../.env") }); // Load .env

// 🔍 Debugging - Check if MONGODB_URI is loaded
console.log("🔍 MongoDB URI from testSubmission.js:", process.env.MONGODB_URI);

// 🔌 Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// 📝 Create a Test Submission
(async () => {
  try {
    const testSubmission = await Submission.create({
      user: "67b5808bc83417ba4d055190", // Replace with a valid user ID from DB
      code: "console.log('Hello World')",
      language: "JavaScript", // Ensure this matches your schema ENUM
      input: "",
      output: "Hello World",
      status: "completed",
      executionTime: 100,
    });

    console.log("✅ Manual Submission Saved:", testSubmission);

    // 📜 Fetch the saved submission to confirm
    const savedSubmission = await Submission.findById(testSubmission._id);
    console.log("🔍 Confirmed Submission in DB:", savedSubmission);

  } catch (error) {
    console.error("❌ Error Saving Manual Submission:", error);
  } finally {
    mongoose.connection.close(); // Close DB connection
  }
})();
