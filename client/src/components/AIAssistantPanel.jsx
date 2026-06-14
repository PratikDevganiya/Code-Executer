import { useMemo, useState } from "react";
import { FaBolt, FaBrain, FaBug, FaFlask, FaLightbulb, FaRobot } from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import aiAssistantService from "../services/aiAssistantService";

const TASK_OPTIONS = [
  {
    id: "explain",
    label: "Explain",
    icon: FaLightbulb,
    description: "Understand logic, structure, and flow.",
  },
  {
    id: "debug",
    label: "Debug",
    icon: FaBug,
    description: "Find likely issues and fixes.",
  },
  {
    id: "optimize",
    label: "Optimize",
    icon: FaBolt,
    description: "Improve code quality and performance.",
  },
  {
    id: "tests",
    label: "Test Cases",
    icon: FaFlask,
    description: "Generate useful test scenarios.",
  },
];

const EMPTY_STATE_COPY = {
  explain: "Get a clear explanation of your current code, including important sections and behavior.",
  debug: "Inspect the current code and any output to spot likely bugs, logic issues, and runtime risks.",
  optimize: "Review the code for readability, maintainability, and performance improvements.",
  tests: "Generate practical manual or automated test cases covering happy paths and edge cases.",
};

const AIAssistantPanel = ({
  code,
  language,
  input,
  output,
  isDisabled,
  disabledReason,
}) => {
  const [selectedTask, setSelectedTask] = useState("explain");
  const [customPrompt, setCustomPrompt] = useState("");
  const [assistantResult, setAssistantResult] = useState("");
  const [assistantModel, setAssistantModel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedTaskMeta = useMemo(
    () => TASK_OPTIONS.find((task) => task.id === selectedTask) || TASK_OPTIONS[0],
    [selectedTask]
  );

  const handleAskAssistant = async () => {
    if (isDisabled || !code.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await aiAssistantService.requestAssistantHelp({
        task: selectedTask,
        code,
        language,
        input,
        output,
        customPrompt,
      });

      setAssistantResult(response.content || "");
      setAssistantModel(response.model || "");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to get AI assistance right now.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-[#254E58]/20 bg-white shadow-md">
      <div className="border-b border-[#88BDBC]/30 bg-[#F5FBFB] px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#254E58]">
              <FaRobot className="text-sm" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
                AI Assistant
              </h2>
            </div>
            <p className="mt-1 text-sm text-[#254E58]/80">
              Explain code, debug issues, optimize logic, and generate test cases.
            </p>
          </div>
          {assistantModel && (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#88BDBC]/20 px-3 py-1 text-xs font-medium text-[#254E58]">
              <FaBrain />
              {assistantModel}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {TASK_OPTIONS.map((task) => {
            const Icon = task.icon;
            const isActive = task.id === selectedTask;

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedTask(task.id)}
                className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                  isActive
                    ? "border-[#254E58] bg-[#254E58] text-white"
                    : "border-[#88BDBC]/40 bg-white text-[#254E58] hover:bg-[#88BDBC]/10"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Icon />
                  {task.label}
                </div>
                <p className={`mt-2 text-xs ${isActive ? "text-white/85" : "text-[#254E58]/70"}`}>
                  {task.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-[#88BDBC]/30 bg-[#FCFFFF] p-3">
          <p className="text-sm font-medium text-[#254E58]">{selectedTaskMeta.label}</p>
          <p className="mt-1 text-sm text-[#254E58]/75">
            {EMPTY_STATE_COPY[selectedTask]}
          </p>
        </div>

        <div>
          <label htmlFor="assistantPrompt" className="mb-2 block text-sm font-medium text-[#254E58]">
            Extra instructions
          </label>
          <textarea
            id="assistantPrompt"
            value={customPrompt}
            onChange={(event) => setCustomPrompt(event.target.value)}
            placeholder="Optional: ask about a specific function, bug, optimization strategy, or preferred test style."
            className="min-h-[110px] w-full rounded-lg border border-[#88BDBC]/40 bg-white px-3 py-3 text-sm text-[#112D32] placeholder:text-[#254E58]/45 focus:outline-none focus:ring-2 focus:ring-[#88BDBC]"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#254E58]/75">
            {isDisabled ? disabledReason : "The assistant uses your current code, language, input, and output."}
          </div>
          <button
            type="button"
            onClick={handleAskAssistant}
            disabled={isDisabled || isLoading || !code.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#254E58] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#112D32] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" />
                Thinking...
              </>
            ) : (
              <>
                <FaRobot />
                Ask Assistant
              </>
            )}
          </button>
        </div>

        {(assistantResult || error) && (
          <div className="rounded-lg border border-[#254E58]/20 bg-[#112D32] text-white shadow-inner">
            <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">
              Assistant Response
            </div>
            <div className="max-h-[360px] overflow-y-auto px-4 py-4">
              {error ? (
                <p className="text-sm text-red-300">{error}</p>
              ) : (
                <pre className="whitespace-pre-wrap font-['Fira Code'] text-xs sm:text-sm leading-6">
                  {assistantResult}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AIAssistantPanel;
