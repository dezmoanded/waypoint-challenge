import { extractLessonModel } from "../../llm/extractLessonModel.js";
import { extractLessonText } from "../../pdf/extractLessonText.js";

const DEFAULT_LESSON_PDF_PATH = process.env.LESSON_PDF_PATH ?? "lesson.pdf";

async function buildLessonModelResourceText() {
  const lessonText = await extractLessonText(DEFAULT_LESSON_PDF_PATH);
  const lessonModel = await extractLessonModel(lessonText.rawText);

  return JSON.stringify(
    {
      source: {
        pdfPath: DEFAULT_LESSON_PDF_PATH,
      },
      rawTextLength: lessonText.rawText.length,
      model: lessonModel,
    },
    null,
    2,
  );
}

export const LESSON_MODEL_RESOURCE = {
  name: "lesson-model",
  uri: "lesson://model",
  metadata: {
    title: "Lesson Structured Model",
    description:
      "Normalized lesson model with headings, objectives, materials, steps, checks for understanding, and assessments.",
    mimeType: "application/json",
  },
  async read() {
    const text = await buildLessonModelResourceText();

    return {
      contents: [
        {
          uri: "lesson://model",
          mimeType: "application/json",
          text,
        },
      ],
    };
  },
};
