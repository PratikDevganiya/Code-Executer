const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const util = require("util");

// Convert exec to return a Promise
const execPromise = util.promisify(exec);

const runCodeInDocker = async (code, language, input) => {
  try {
    // ✅ Step 1: Validate Supported Language
    if (language !== "javascript") {
      throw new Error("Only JavaScript execution is supported for now.");
    }

    // ✅ Step 2: Create a Temporary JavaScript File
    const tempFilePath = path.join(__dirname, "tempCode.js");
    fs.writeFileSync(tempFilePath, code);

    // ✅ Step 3: Run Code in a Node.js Docker Container
    const dockerCommand = `docker run --rm -v ${tempFilePath}:/app/code.js node:18 node /app/code.js`;

    console.log(`Executing command: ${dockerCommand}`); // Debugging

    const { stdout, stderr } = await execPromise(dockerCommand);

    // ✅ Step 4: Return Execution Output
    if (stderr) {
      throw new Error(stderr);
    }

    return stdout.trim();
  } catch (error) {
    return `Execution Error: ${error.message}`;
  }
};

module.exports = { runCodeInDocker };
