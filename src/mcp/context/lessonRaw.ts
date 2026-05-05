import { extractLessonText } from "../../pdf/extractLessonText.js";

const DEFAULT_LESSON_PDF_PATH = process.env.LESSON_PDF_PATH ?? "lesson.pdf";

async function buildLessonRawResourceText() {
  const lessonText = await extractLessonText(DEFAULT_LESSON_PDF_PATH);
  return lessonText.rawText;
}

export const LESSON_RAW_RESOURCE = {
  name: "lesson-raw",
  uri: "lesson://raw",
  metadata: {
    title: "Lesson Raw Text",
    description:
      "Raw lesson content extracted from the source lesson artifact before chunking or semantic normalization.",
    mimeType: "text/plain",
  },
  async read() {
    const text = await buildLessonRawResourceText();

    return {
      contents: [
        {
          uri: "lesson://raw",
          mimeType: "text/plain",
          text,
        },
      ],
    };
  },
};
