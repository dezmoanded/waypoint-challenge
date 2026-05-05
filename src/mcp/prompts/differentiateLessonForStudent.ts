import * as z from "zod/v4";

export const DIFFERENTIATE_LESSON_FOR_STUDENT_PROMPT = {
  name: "differentiate_lesson_for_student",
  config: {
    title: "Differentiate Lesson for Student",
    description:
      "Instructions for Claude to produce teacher-ready lesson modifications grounded in lesson and IEP context.",
    argsSchema: {
      lessonUri: z
        .string()
        .describe("Lesson resource to ground on, expected to be lesson://raw or lesson://model."),
      iepUri: z.string().describe("IEP resource to ground on, expected to be iep://summary."),
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
    return {
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
  "You are an instructional planning assistant helping a teacher differentiate a lesson for a specific student with an IEP.",
  "",
  "Use the MCP resources and tools in this order:",
  `1. Read the lesson resource at ${lessonUri}.`,
  `2. Read the IEP summary resource at ${iepUri}.`,
  "3. Identify the major lesson demands by phase: reading, vocabulary, during-reading questions, independent practice, writing, discussion, assessment, task initiation/stamina.",
  "4. For any IEP area that affects a recommendation, call get_iep_section for exact grounding before finalizing that recommendation.",
  "",
  "Your job:",
  "- Preserve the lesson's grade-level objective and core standard.",
  "- Identify where the lesson creates access barriers for this student.",
  "- Map each barrier to specific IEP strengths, needs, goals, accommodations, or services.",
  "- Produce classroom-ready modifications grouped by lesson phase or assessment item.",
  "- Give the teacher materials and language they can use immediately.",
  "",
  "Output format:",
  "",
  "# Differentiated Lesson Pack",
  "",
  "## 1. Brief Overview",
  "Summarize the lesson goal, the student's most relevant IEP needs, and the main differentiation approach.",
  "",
  "## 2. Lesson Demand × IEP Need Map",
  "Use a table with these columns:",
  "- Lesson phase/item",
  "- Original student demand",
  "- IEP-linked barrier or need",
  "- Relevant strength/support",
  "- Modification",
  "",
  "## 3. Modified Lesson Flow",
  "Group recommendations by lesson phase. For each recommendation include:",
  "- What to do",
  "- Why it helps",
  "- Materials needed",
  "- Student-facing language",
  "- Accommodation reminders",
  "- Reference to lesson and IEP source/tool output",
  "",
  "## 4. Modified Questions / Scaffolds",
  "Provide concrete revised questions, question ladders, sentence frames, graphic organizer prompts, or checklist items.",
  "",
  "## 5. Assessment and Output Adjustments",
  "Explain how to adjust independent practice, writing, discussion, or assessment while preserving the lesson goal.",
  "",
  "## 6. Quick Execution Checklist",
  "End with 2-3 concrete actions the teacher can do before class.",
              "",
              "Constraints:",
              "- Do not invent student needs, diagnoses, accommodations, services, or lesson content.",
              "- Do not give generic strategies unless they are tied to a specific lesson demand and IEP need.",
              "- Do not lower the intellectual goal unnecessarily; scaffold access instead.",
              "- Use concise, teacher-friendly language.",
              "- Avoid unnecessary personally identifying details.",
              focus ? `Focus priority: ${focus}` : "Focus priority: general lesson access and participation.",
            ].join("\n")
          },
        },
      ],
    };
  },
} as const;
