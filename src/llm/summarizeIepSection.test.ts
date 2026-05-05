import { summarizeIepSection } from "./summarizeIepSection.js";
import { setClaudeCallerForTests, ClaudeLikeResponse } from "./shared.js";

async function main() {
  // Mock Claude to return a fixed IEP section summary JSON
  setClaudeCallerForTests(async () => {
    const payload = {
      section: "Accommodations",
      title: "Testing and classroom accommodations",
      summary:
        "Student benefits from extended time (1.5x) and small-group testing. Provide clear, concise directions and visual organizers.",
      keyFacts: [
        "Extended time 1.5x on quizzes and tests",
        "Small-group setting for assessments",
        "Read-aloud for directions only",
      ],
      instructionalImplications: [
        "Chunk multi-step tasks and set interim checkpoints",
        "Offer graphic organizers before reading and writing tasks",
      ],
      teacherSupports: [
        "Graphic organizer for main idea/details",
        "Pre-taught vocabulary list",
      ],
      risksOrWatchFors: [
        "Fatigue near end of class",
        "Rushing when time is called",
      ],
      exactLookupRecommendedFor: [
        "Confirm which assessments qualify for extended time",
      ],
    };

    const resp: ClaudeLikeResponse = {
      content: [{ type: "text", text: JSON.stringify(payload) }],
    };
    return resp;
  });

  const result = await summarizeIepSection(
    "Accommodations",
    "Student receives extended time (1.5x) and small-group testing. Directions may be read aloud; content is not read aloud."
  );

  console.assert(result.section === "Accommodations", "section should match");
  console.assert(
    Array.isArray(result.keyFacts) &&
      result.keyFacts.includes("Extended time 1.5x on quizzes and tests"),
    "keyFacts should include extended time"
  );
  console.assert(result.summary && result.summary.length > 0, "summary not empty");

  // Reset mock
  setClaudeCallerForTests(null);

  console.log("summarizeIepSection.test.ts PASS");
}

main().catch((err) => {
  console.error("summarizeIepSection.test.ts FAIL", err);
  process.exit(1);
});
