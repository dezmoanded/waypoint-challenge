import * as z from "zod/v4";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Load the markdown prompt template relative to this file so callers (Claude/Codex) do not
// need to pass absolute paths or rely on process.cwd(). This works with tsx/ESM.
const PROMPT_FILE_URL = new URL(
  "../../prompts/differentiate_lesson_for_student.md",
  import.meta.url,
);

let PROMPT_TEMPLATE = "";
try {
  PROMPT_TEMPLATE = readFileSync(fileURLToPath(PROMPT_FILE_URL), "utf8");
} catch (err) {
  // Safe fallback to keep the MCP surface usable even if the file is missing.
  PROMPT_TEMPLATE = [
    "# Prompt missing",
    "The prompt markdown could not be loaded. Please ensure src/prompts/differentiate_lesson_for_student.md exists.",
  ].join("\n\n");
}

function renderPrompt({
  lessonUri,
  iepUri,
  focus,
}: {
  lessonUri: string;
  iepUri: string;
  focus?: string;
}) {
  const focusText = focus && focus.trim().length
    ? focus
    : "general lesson access and participation.";

  return PROMPT_TEMPLATE
    .replace(/\{\{lessonUri\}\}/g, lessonUri)
    .replace(/\{\{iepUri\}\}/g, iepUri)
    .replace(/\{\{focus\}\}/g, focusText);
}

export const DIFFERENTIATE_LESSON_FOR_STUDENT_PROMPT = {
  name: "differentiate_lesson_for_student",
  config: {
    title: "Differentiate Lesson for Student",
    description:
      "Instructions for Claude to produce teacher-ready lesson modifications grounded in lesson and IEP context.",
    argsSchema: {
      lessonUri: z
        .string()
        .describe(
          "Lesson resource to ground on, expected to be lesson://raw or lesson://model.",
        ),
      iepUri: z
        .string()
        .describe("IEP resource to ground on, expected to be iep://summary."),
      focus: z
        .string()
        .optional()
        .describe(
          "Optional instructional focus, such as reading comprehension, writing output, executive functioning, or assessment access.",
        ),
    },
  },
  async handler({
    lessonUri,
    iepUri,
    focus,
  }: {
    lessonUri: string;
    iepUri: string;
    focus?: string;
  }) {
    const text = renderPrompt({ lessonUri, iepUri, focus });
    return {
      messages: [
        {
          role: "user" as const,
          content: { type: "text" as const, text },
        },
      ],
    };
  },
} as const;
