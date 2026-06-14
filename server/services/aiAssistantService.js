const axios = require("axios");

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const TASK_CONFIG = {
  explain: {
    title: "Code explanation",
    instruction:
      "Explain what the code does in simple developer-friendly language. Cover the purpose, the main flow, and important edge cases.",
  },
  debug: {
    title: "Debug analysis",
    instruction:
      "Find likely bugs, logic mistakes, runtime issues, and risky assumptions. Prioritize only the most important issues and include concrete fixes.",
  },
  optimize: {
    title: "Optimization review",
    instruction:
      "Suggest the most valuable improvements for performance, readability, and maintainability. Only recommend justified changes.",
  },
  tests: {
    title: "Automated test generation",
    instruction:
      "Generate practical test cases for this code. Focus on happy paths, edge cases, invalid inputs, and regression scenarios.",
  },
};

const collectTextValues = (value, results = []) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) {
      results.push(trimmed);
    }
    return results;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectTextValues(item, results);
    }
    return results;
  }

  if (value && typeof value === "object") {
    const preferredKeys = ["output_text", "text", "refusal", "content", "summary"];

    for (const key of preferredKeys) {
      if (key in value) {
        collectTextValues(value[key], results);
      }
    }
  }

  return results;
};

const extractOutputText = (responseData) => {
  if (typeof responseData?.output_text === "string" && responseData.output_text.trim()) {
    return responseData.output_text.trim();
  }

  const output = Array.isArray(responseData?.output) ? responseData.output : [];
  const textParts = [];

  for (const item of output) {
    if (item?.type === "message" && Array.isArray(item?.content)) {
      for (const content of item.content) {
        if (typeof content?.text === "string" && content.text.trim()) {
          textParts.push(content.text.trim());
        }

        if (
          content?.text &&
          typeof content.text === "object" &&
          typeof content.text?.value === "string" &&
          content.text.value.trim()
        ) {
          textParts.push(content.text.value.trim());
        }

        if (typeof content?.refusal === "string" && content.refusal.trim()) {
          textParts.push(content.refusal.trim());
        }
      }
    }

    if (Array.isArray(item?.summary)) {
      for (const summaryItem of item.summary) {
        if (typeof summaryItem?.text === "string" && summaryItem.text.trim()) {
          textParts.push(summaryItem.text.trim());
        }
      }
    }
  }

  if (textParts.length > 0) {
    return textParts.join("\n\n");
  }

  const fallbackText = collectTextValues(responseData?.output || []);
  if (fallbackText.length > 0) {
    return fallbackText.join("\n\n");
  }

  return "";
};

const buildPrompt = ({ task, code, language, input, output, customPrompt }) => {
  const taskConfig = TASK_CONFIG[task] || TASK_CONFIG.explain;

  const sections = [
    `Task: ${taskConfig.title}`,
    taskConfig.instruction,
    `Language: ${language || "unknown"}`,
    `Code:\n${code}`,
  ];

  if (typeof input === "string" && input.trim()) {
    sections.push(`Program input:\n${input}`);
  }

  if (typeof output === "string" && output.trim()) {
    sections.push(`Observed output or error:\n${output}`);
  }

  if (typeof customPrompt === "string" && customPrompt.trim()) {
    sections.push(`Extra user request:\n${customPrompt.trim()}`);
  }

  sections.push(
    "Keep the answer concise and actionable. Use short markdown headings and brief bullet points. Limit the response to the most useful points."
  );

  return sections.join("\n\n");
};

const generateAssistantResponse = async ({
  task,
  code,
  language,
  input,
  output,
  customPrompt,
}) => {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not configured on the server.");
    error.statusCode = 500;
    throw error;
  }

  const model = process.env.OPENAI_MODEL || "gpt-5-mini";

  const response = await axios.post(
    OPENAI_API_URL,
    {
      model,
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text:
                "You are an expert AI code assistant inside a web IDE. Give precise, practical, trustworthy help. Do not invent execution results. Base your answer only on the provided code and context. Keep answers concise.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildPrompt({ task, code, language, input, output, customPrompt }),
            },
          ],
        },
      ],
      reasoning: { effort: "low" },
      max_output_tokens: 2000,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 45000,
    }
  );

  const assistantText = extractOutputText(response.data);

  if (!assistantText) {
    console.error(
      "AI assistant empty response payload:",
      JSON.stringify(
        {
          id: response.data?.id,
          status: response.data?.status,
          incomplete_details: response.data?.incomplete_details,
          output_count: Array.isArray(response.data?.output) ? response.data.output.length : 0,
        },
        null,
        2
      )
    );

    const incompleteReason =
      response.data?.incomplete_details?.reason ||
      response.data?.status;

    const error = new Error(
      incompleteReason
        ? `The AI assistant response was incomplete (${incompleteReason}).`
        : "The AI assistant returned an empty response."
    );
    error.statusCode = 502;
    throw error;
  }

  return {
    model,
    content: assistantText,
  };
};

module.exports = {
  generateAssistantResponse,
  TASK_CONFIG,
};
