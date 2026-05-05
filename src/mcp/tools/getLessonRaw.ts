import { LESSON_RAW_RESOURCE } from "../context/lessonRaw.js";

export const GET_LESSON_RAW_TOOL = {
  name: "get_lesson_raw",
  config: {
    title: "Get Lesson Raw",
    description:
      "Fetch the raw lesson text that is also exposed as the lesson://raw MCP resource.",
  },
  async handler() {
    const result = await LESSON_RAW_RESOURCE.read();
    return {
      content: result.contents.map((item) => ({
        type: "text" as const,
        text: item.text,
      })),
    };
  },
} as const;
