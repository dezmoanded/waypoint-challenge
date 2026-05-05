import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { extractIepSections, HEADINGS } from "./extractIepSections.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

async function main(): Promise<void> {
  const pdfPath = path.join(repoRoot, "iep.pdf");
  const sections = await extractIepSections(pdfPath);

  assert.equal(typeof sections.rawText, "string");
  assert.ok(sections.rawText.length > 0, "rawText should be populated");

  for (const [key] of HEADINGS) {
    assert.ok(key in sections, `expected section key ${key} to exist`);
    assert.equal(typeof sections[key], "string", `${key} should be a string`);
  }

  const expectedPopulatedSections = [
    "studentAndParentConcerns",
    "studentVision",
    "studentProfile",
    "presentLevelsAcademics",
    "accommodationsAndModifications",
    "measurableAnnualGoals",
    "serviceDelivery"
  ] as const;

  for (const key of expectedPopulatedSections) {
    assert.ok(sections[key].length > 0, `${key} should not be empty for the provided iep.pdf`);
  }

  console.log("IEP parser test passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
