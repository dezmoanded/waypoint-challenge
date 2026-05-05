import { extractRawPdfText } from "./shared.js";

export type LessonText = {
  rawText: string;
};

export async function extractLessonText(pdfPath: string): Promise<LessonText> {
  const rawText = await extractRawPdfText(pdfPath);
  return { rawText };
}

async function main(): Promise<void> {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error("Usage: tsx src/pdf/extractLessonText.ts <path-to-pdf>");
    process.exit(1);
  }

  const result = await extractLessonText(pdfPath);
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
