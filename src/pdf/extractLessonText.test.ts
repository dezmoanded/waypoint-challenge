import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { extractLessonText } from "./extractLessonText.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

async function main(): Promise<void> {
  const pdfPath = path.join(repoRoot, "lesson.pdf");
  const lesson = await extractLessonText(pdfPath);

  assert.equal(typeof lesson.rawText, "string");
  assert.ok(lesson.rawText.length > 0, "rawText should be populated");
  assert.ok(!/^\s+$/.test(lesson.rawText), "rawText should not be whitespace only");

  console.log("Lesson parser test passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
