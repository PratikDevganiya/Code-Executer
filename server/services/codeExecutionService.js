const axios = require('axios');
require('dotenv').config(); // Explicitly load environment variables

// Use Judge0 CE (Community Edition) public API with the correct endpoint
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY; // Use the existing API key from .env
const JUDGE0_RAPID_API_HOST = 'judge0-ce.p.rapidapi.com';

// For debugging
// console.log('JUDGE0_API_URL:', JUDGE0_API_URL);
// console.log('JUDGE0_API_KEY:', JUDGE0_API_KEY ? 'is set' : 'is NOT set');

// Language ID mapping for Judge0
const languageIds = {
  javascript: 63,  // Node.js
  typescript: 74,  // TypeScript
  python: 71,      // Python 3
  java: 62,        // Java
  c: 50,           // C (GCC)
  cpp: 54,         // C++ (GCC)
  "c++": 54,       // C++ (GCC) - Alternative name
  csharp: 51,      // C#
  "c#": 51,        // C# - Alternative name
  php: 68,         // PHP
  go: 60,          // Go
  rust: 73,        // Rust
  ruby: 72,        // Ruby
  swift: 83,       // Swift
  kotlin: 78       // Kotlin
};

const runCode = async (code, language, input = "") => {
  try {
    // Normalize language name
    const normalizedLanguage = language.toLowerCase();
    
    // Validate language support
    const languageId = languageIds[normalizedLanguage];
    if (!languageId) {
      console.error(`Unsupported language: ${language}`);
      throw new Error(`Unsupported language: ${language}`);
    }

    // Prepare submission
    const submission = {
      source_code: code,
      language_id: languageId,
      stdin: input,
      // Optional parameters (can be adjusted)
      cpu_time_limit: 5,      // 5 seconds
      memory_limit: 128000,   // 128MB
    };

    // Create submission with RapidAPI authentication
    const createResponse = await axios.post(`${JUDGE0_API_URL}/submissions`, submission, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': JUDGE0_RAPID_API_HOST
      }
    });

    const token = createResponse.data.token;

    // Poll for results
    let result;
    for (let i = 0; i < 10; i++) {
      const getResponse = await axios.get(`${JUDGE0_API_URL}/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': JUDGE0_RAPID_API_HOST
        }
      });

      result = getResponse.data;

      if (result.status && result.status.id > 2) { // Status > 2 means processing is done
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before polling again
    }

    // Process result
    if (!result) {
      throw new Error("Execution timeout");
    }

    // Map Judge0 status to your status format
    const statusMap = {
      3: "completed",    // Accepted
      4: "error",       // Wrong Answer
      5: "error",       // Time Limit Exceeded
      6: "error",       // Compilation Error
      7: "runtime_error", // Runtime Error (SIGSEGV, SIGFPE, etc.)
      13: "runtime_error" // Internal Error
    };

    return {
      message: result.status.description,
      output: result.stdout || result.stderr || result.compile_output || "No output",
      status: statusMap[result.status.id] || "error",
      executionTime: result.time ? parseFloat(result.time) * 1000 : 0 // Convert to milliseconds
    };
  } catch (error) {
    console.error("Code Execution Error:", error);
    return {
      message: "Execution failed",
      output: `Error: ${error.message}`,
      status: "error",
      executionTime: 0
    };
  }
};

module.exports = { runCode, languageIds };

