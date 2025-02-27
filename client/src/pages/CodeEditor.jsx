// client/src/pages/CodeEditor.jsx
import { useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const CodeEditor = () => {
  const { user } = useAuth();
  const [code, setCode] = useState("// Start coding here...");
  const [language, setLanguage] = useState("javascript");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("vs-dark");

  const monaco = useMonaco();

  // Define custom themes
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("monokai", {
        base: "vs-dark",
        inherit: true,
        rules: [{ background: "272822" }],
        colors: {
          "editor.background": "#272822",
          "editor.foreground": "#F8F8F2",
        },
      });

      monaco.editor.defineTheme("dracula", {
        base: "vs-dark",
        inherit: true,
        rules: [{ background: "282A36" }],
        colors: {
          "editor.background": "#282A36",
          "editor.foreground": "#F8F8F2",
        },
      });

      monaco.editor.defineTheme("github-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [{ background: "0D1117" }],
        colors: {
          "editor.background": "#0D1117",
          "editor.foreground": "#C9D1D9",
          "editorCursor.foreground": "#F78166",
          "editor.lineHighlightBackground": "#363B46",
          "editorLineNumber.foreground": "#8B949E",
          "editor.selectionBackground": "#264F78",
          "editor.inactiveSelectionBackground": "#1C2B3A",
        },
      });

      monaco.editor.defineTheme("github-light", {
        base: "vs",
        inherit: true,
        rules: [{ background: "FFFFFF" }],
        colors: {
          "editor.background": "#FFFFFF",
          "editor.foreground": "#24292E",
          "editorCursor.foreground": "#0969DA",
          "editor.lineHighlightBackground": "#F6F8FA",
          "editorLineNumber.foreground": "#6E7781",
          "editor.selectionBackground": "#B4D6FC",
          "editor.inactiveSelectionBackground": "#D0E5FF",
        },
      });

      monaco.editor.defineTheme("solarized-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [{ background: "002B36" }],
        colors: {
          "editor.background": "#002B36",
          "editor.foreground": "#839496",
        },
      });

      monaco.editor.defineTheme("solarized-light", {
        base: "vs",
        inherit: true,
        rules: [{ background: "FDF6E3" }],
        colors: {
          "editor.background": "#FDF6E3",
          "editor.foreground": "#657B83",
        },
      });

      monaco.editor.setTheme(theme); // Apply selected theme
    }
  }, [monaco, theme]);

  const handleSubmit = async () => {
    if (!user) {
      setOutput("⚠ Please login to execute code");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5001/execute",
        { code, language, input },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setOutput(response.data.output);
    } catch (error) {
      setOutput(error.response?.data?.message || "⚠ Error executing code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBE5C2] p-6 flex flex-col items-center">
      {/* Language & Theme Selectors */}
      <div className="w-[85%] flex justify-start mb-2">
        <div className="flex gap-4">
          {/* Language Selector */}
          <select
            className="w-52 px-3 py-2 bg-[#8B8558] text-white font-semibold rounded-md 
               shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 
               focus:ring-[#E6C48E] transition cursor-pointer hover:bg-[#6B6343] text-left"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="c++">C++</option>
            <option value="c#">C#</option>
            <option value="php">PHP</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="ruby">Ruby</option>
            <option value="swift">Swift</option>
            <option value="kotlin">Kotlin</option>
          </select>

          {/* Theme Selector */}
          <select
            className="w-52 px-3 py-2 bg-[#8B8558] text-white font-semibold rounded-md 
               shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 
               focus:ring-[#E6C48E] transition cursor-pointer hover:bg-[#6B6343] text-left"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="vs-dark">Dark</option>
            <option value="light">Light</option>
            <option value="hc-black">High Contrast Black</option>
            <option value="hc-light">High Contrast Light</option>
            <option value="monokai">Monokai</option>
            <option value="dracula">Dracula</option>
            <option value="github-dark">GitHub Dark</option>
            <option value="github-light">GitHub Light</option>
            <option value="solarized-dark">Solarized Dark</option>
            <option value="solarized-light">Solarized Light</option>
          </select>
        </div>
      </div>

      {/* Main Container - Editor (Left) | Input & Output (Right) */}
      <div className="w-[85%] grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Code Editor - Left Side (Now spans 3 columns) */}
        <div
          className="lg:col-span-3 border border-[#8B8558]/40 rounded-lg overflow-hidden 
                     shadow-xl bg-[#8B8558]/20 backdrop-blur-md p-2 h-[90vh]"
        >
          <Editor
            height="90%"
            language={language}
            value={code}
            onChange={setCode}
            theme={theme}
            options={{
              minimap: { enabled: false },
              fontSize: 16, // Increased font size
              fontFamily: "'Fira Code', monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 10, bottom: 10 },
            }}
          />
        </div>

        {/* Right Side - Output on Top, Input Below (Now spans 1 column) */}
        <div className="flex flex-col h-[88vh]">
          {/* Output Box */}
          <div
            className="h-[50%] p-4 border border-[#8B8558]/30 rounded-lg bg-[#6B6343] 
                       text-[#EBE5C2] overflow-auto shadow-lg font-['Fira Code'] text-sm mb-4"
          >
            <div className="sticky top-0 bg-[#6B6343] pb-2 mb-2 border-b border-[#8B8558]/30">
              📝 Output
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <pre className="whitespace-pre-wrap">
                {output || "Output will appear here..."}
              </pre>
            )}
          </div>

          {/* Input Box */}
          <div className="flex flex-col h-[40%] gap-4">
            <div className="flex-grow">
              <div className="sticky top-0 text-[#6B6343] pb-2 font-['Fira Code']">
                🔹 Custom Input (Optional)
              </div>
              <textarea
                className="w-full h-[calc(100%-30px)] p-4 border border-[#8B8558]/30 rounded-lg 
                        bg-[#5A5A5A] text-white placeholder-[#E6C48E] focus:outline-none 
                        focus:ring-2 focus:ring-[#8B8558] resize-none shadow-lg 
                        font-['Fira Code'] text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {/* Run Button */}
            <button
              className="w-full px-6 py-3 bg-[#8B8558] text-white font-semibold rounded-lg 
                      shadow-md hover:bg-[#6B6343] transition-all duration-300 transform 
                      hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="small" />
                  Executing...
                </span>
              ) : (
                "Run Code"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
