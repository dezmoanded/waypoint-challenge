import { LESSON_MODEL_RESOURCE } from "../context/lessonModel.js";

export const GET_LESSON_MODEL_TOOL = {
  name: "get_lesson_model",
  config: {
    title: "Get Lesson Model",
    description:
      "Fetch the structured lesson model that is also exposed as the lesson://model MCP resource.",
  },
  async handler() {
    const result = await LESSON_MODEL_RESOURCE.read();
    return {
      content: result.contents.map((item) => ({
        type: "text" as const,
        text: item.text,
      })),
    };
  },
} as const;
