const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const util = require("util");

// Convert exec to return a Promise
const execPromise = util.promisify(exec);

const runCodeInDocker = async (code, language, input = "") => {
  try {
    // ✅ Step 1: Validate Supported Language
    const supportedLanguages = {
      javascript: { ext: "js", dockerImage: "node:18", runCmd: "node" },
      python: { ext: "py", dockerImage: "python:3.9", runCmd: "python3" },
    };

    if (!supportedLanguages[language]) {
      throw new Error("Only JavaScript and Python execution are supported for now.");
    }

    // ✅ Step 2: Create Temporary Files
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const fileExt = supportedLanguages[language].ext;
    const tempFilePath = path.join(tempDir, `tempCode.${fileExt}`);
    const inputFilePath = path.join(tempDir, "input.txt");

    // ✅ Always Write Code to a File
    fs.writeFileSync(tempFilePath, code);

    // ✅ Always Create `input.txt` (Even if Empty)
    fs.writeFileSync(inputFilePath, input || " "); // Write space to ensure file is not empty

    // ✅ Step 3: Run Code in Docker Container
    const dockerImage = supportedLanguages[language].dockerImage;
    const runCmd = supportedLanguages[language].runCmd;

    // ✅ Fix: Remove `< /app/input.txt` and Use Argument Instead
    const dockerCommand = `
      docker run --rm \
      -v "${tempFilePath}:/app/code.${fileExt}" \
      -v "${inputFilePath}:/app/input.txt" \
      ${dockerImage} ${runCmd} /app/code.${fileExt} /app/input.txt
    `.trim();

    

    // ✅ Execute Docker Command
    const { stdout, stderr } = await execPromise(dockerCommand);

    // ✅ Step 4: Cleanup Temporary Files
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(inputFilePath);

    // ✅ Step 5: Return Execution Output
    return {
      message: "Execution successful",
      output: stdout.trim() || stderr.trim(), // Return stderr if stdout is empty
    };
  } catch (error) {
    return {
      message: "Execution failed",
      output: `Execution Error: ${error.message}`,
    };
  }
};

module.exports = { runCodeInDocker };
