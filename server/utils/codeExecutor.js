const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");

const runCode = async (code, language, input = "") => {
  try {
    const timestamp = Date.now();
    const filename = `code_${timestamp}`;
    let cmd = "";
    let extension = "";

    // ✅ Ensure temp directory exists
    const tempDir = path.join(__dirname, "..", "temp");
    await fs.mkdir(tempDir, { recursive: true });

    switch (language) {
      case "javascript":
        extension = "js";
        cmd = `node ${path.join(tempDir, filename + ".js")}`;
        break;
      case "typescript":
        extension = "ts";
        cmd = `ts-node ${path.join(tempDir, filename + ".ts")}`;
        break;
      case "python":
        extension = "py";
        cmd = `python3 ${path.join(tempDir, filename + ".py")}`;
        break;
      case "java":
        extension = "java";
        const className = `Main_${timestamp}`;
        const javaFilePath = path.join(tempDir, `${className}.java`);
        code = `public class ${className} {\n  public static void main(String[] args) {\n    ${code}\n  }\n}`;
        await fs.writeFile(javaFilePath, code);
        cmd = `javac ${javaFilePath} && java -cp ${tempDir} ${className}`;
        break;
      case "c":
        extension = "c";
        cmd = `gcc ${path.join(tempDir, filename + ".c")} -o ${path.join(tempDir, filename)} && ${path.join(tempDir, filename)}`;
        break;
      case "c++":
        extension = "cpp";
        cmd = `g++ ${path.join(tempDir, filename + ".cpp")} -o ${path.join(tempDir, filename)} && ${path.join(tempDir, filename)}`;
        break;
      case "c#":
        extension = "cs";
        const csFilePath = path.join(tempDir, `${filename}.cs`);
        await fs.writeFile(csFilePath, code);
        cmd = `mcs ${csFilePath} -out:${path.join(tempDir, filename + ".exe")} && mono ${path.join(tempDir, filename + ".exe")}`;
        break;
      case "php":
        extension = "php";
        cmd = `php ${path.join(tempDir, filename + ".php")}`;
        break;
      case "go":
        extension = "go";
        cmd = `go run ${path.join(tempDir, filename + ".go")}`;
        break;
      case "rust":
        extension = "rs";
        cmd = `rustc ${path.join(tempDir, filename + ".rs")} -o ${path.join(tempDir, filename)} && ${path.join(tempDir, filename)}`;
        break;
      case "ruby":
        extension = "rb";
        cmd = `ruby ${path.join(tempDir, filename + ".rb")}`;
        break;
      case "swift":
        extension = "swift";
        cmd = `swift ${path.join(tempDir, filename + ".swift")}`;
        break;
      case "kotlin":
        extension = "kt";
        cmd = `kotlinc ${path.join(tempDir, filename + ".kt")} -include-runtime -d ${path.join(tempDir, filename + ".jar")} && java -jar ${path.join(tempDir, filename + ".jar")}`;
        break;
      default:
        throw new Error("🚨 Language not supported");
    }

    // ✅ Write code to file
    const filePath = path.join(tempDir, `${filename}.${extension}`);
    await fs.writeFile(filePath, code);

    // ✅ Write input to file if provided
    let inputPath;
    if (input) {
      inputPath = path.join(tempDir, `${filename}.txt`);
      await fs.writeFile(inputPath, input);
      cmd = `/bin/sh -c "${cmd} < ${inputPath}"`;
    }

    return new Promise((resolve, reject) => {
      exec(
        cmd,
        {
          timeout: 5000, // ⏳ 5-second timeout
          cwd: tempDir,
        },
        async (error, stdout, stderr) => {
          // ✅ Clean up files after execution
          try {
            await fs.unlink(filePath);
            if (inputPath) await fs.unlink(inputPath);
          } catch (cleanupError) {
            console.error("⚠️ Error cleaning up files:", cleanupError);
          }

          // ✅ Enhanced Error Handling
          if (error && !stdout) {
            if (error.killed) return reject(new Error("⏳ Execution timed out"));
            return reject(new Error(stderr || error.message));
          }

          resolve(stdout.trim());
        }
      );
    });
  } catch (error) {
    throw new Error(`Execution failed: ${error.message}`);
  }
};

// ✅ Controller Function
const executeCode = async (req, res) => {
  try {
    const DEBUG = false; // Set to true for debugging
    if (DEBUG) console.log("🔍 Incoming Request Body:", req.body);

    const { code, language, input } = req.body || {};

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    const output = await runCode(code, language, input);
    
    return res.json({ message: "Execution successful", output });
  } catch (error) {
    console.error("Execution Error:", error);
    return res.status(500).json({ message: "Execution failed", error: error.message });
  }
};

module.exports = { runCode, executeCode };
