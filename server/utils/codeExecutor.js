const { runCode, languageIds } = require('../services/codeExecutionService');

// ✅ Controller Function
const executeCode = async (req, res) => {
  try {
    const DEBUG = false; // Set to true for debugging
    if (DEBUG) console.log("🔍 Incoming Request Body:", req.body);

    const { code, language, input } = req.body || {};

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    // Use the updated runCode function from codeExecutionService
    const result = await runCode(code, language, input);
    
    return res.json({ 
      message: result.message, 
      output: result.output,
      status: result.status,
      executionTime: result.executionTime
    });
  } catch (error) {
    console.error("Execution Error:", error);
    return res.status(500).json({ message: "Execution failed", error: error.message });
  }
};

// ✅ Get Supported Languages
const getSupportedLanguages = (req, res) => {
  try {
    // Filter out duplicate language IDs (keep only unique languages)
    const uniqueLanguages = [];
    const seenIds = new Set();
    
    for (const [lang, id] of Object.entries(languageIds)) {
      if (!seenIds.has(id)) {
        uniqueLanguages.push(lang);
        seenIds.add(id);
      }
    }
    
    return res.json({
      languages: uniqueLanguages
    });
  } catch (error) {
    console.error("Error getting languages:", error);
    return res.status(500).json({ message: "Failed to get supported languages", error: error.message });
  }
};

module.exports = { executeCode, getSupportedLanguages };
