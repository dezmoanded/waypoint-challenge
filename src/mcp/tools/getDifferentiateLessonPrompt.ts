import { z } from "zod";

import { DIFFERENTIATE_LESSON_FOR_STUDENT_PROMPT } from "../prompts/differentiateLessonForStudent.js";

const inputSchema = z.object({
  lessonUri: z
    .string()
    .default("lesson://model")
    .describe("Lesson resource to ground on, usually lesson://raw or lesson://model."),
  iepUri: z
    .string()
    .default("iep://summary")
    .describe("IEP resource to ground on, usually iep://summary."),
  focus: z
    .string()
    .optional()
    .describe(
      "Optional instructional focus, such as reading comprehension, writing output, executive functioning, or assessment access.",
    ),
});

export const GET_DIFFERENTIATE_LESSON_PROMPT_TOOL = {
  name: "get_differentiate_lesson_prompt",
  config: {
    title: "Get Differentiate Lesson Prompt",
    description:
      "Fetch the differentiate_lesson_for_student prompt payload as tool output for Claude Desktop compatibility.",
    inputSchema,
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
    const result = await DIFFERENTIATE_LESSON_FOR_STUDENT_PROMPT.handler({
      lessonUri,
      iepUri,
      focus,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
} as const;
