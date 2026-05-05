import { extractLessonModel } from "./extractLessonModel.js";
import { setClaudeCallerForTests, ClaudeLikeResponse } from "./shared.js";

async function main() {
  try {
    // Mock Claude to return a fixed lesson model JSON
    setClaudeCallerForTests(async () => {
      const payload = {
        title: "The Dust Bowl",
        unit: "Environmental History",
        grade: "7",
        sourceTextTitle: "Dust Storms on the Plains",
        author: "N/A",
        textType: "informational",
        standard: "RI.7.2",
        skillFocus: "Determine central idea",
        knowledgeFocus: "Great Depression agriculture",
        vocabulary: [
          {
            term: "erosion",
            studentFriendlyDefinition: "when wind or water wears soil away",
            appearsInLesson: true,
          },
          {
            term: "drought",
            studentFriendlyDefinition: "a long period with very little rain",
            appearsInLesson: true,
          },
        ],
        pacing: [
          {
            phase: "Warm-up",
            minutes: 5,
            description: "Activate background knowledge about farming conditions.",
          },
          {
            phase: "Close Read",
            minutes: 25,
            description: "Read and annotate the article, then answer text questions.",
          },
        ],
        lessonPhases: [
          {
            name: "Close Read",
            modality: "partner",
            studentTasks: [
              "Read the article with a partner",
              "Annotate details about causes of the Dust Bowl",
              "Answer text-dependent questions",
            ],
            teacherMoves: [
              "Model annotation on the first paragraph",
              "Prompt students to cite evidence in discussion",
            ],
            questions: [
              {
                text: "What is the central idea of the article?",
                questionType: "central_idea",
                isOptionalSupport: false,
              },
              {
                text: "Which details show how drought contributed to the Dust Bowl?",
                questionType: "evidence",
                isOptionalSupport: false,
              },
            ],
          },
        ],
        assessments: [
          {
            type: "short_response",
            prompt: "Explain how drought contributed to the Dust Bowl using evidence.",
            standard: "RI.7.2",
            studentOutput: "A short written response citing evidence from the article.",
            successCriteria: [
              "States the central idea",
              "Uses at least one detail from the text",
            ],
          },
        ],
        discussionTasks: [
          {
            prompt: "How did farmers respond to the drought?",
            expectedStudentAction: "Discuss with a partner and cite details from the text.",
          },
        ],
        instructionalDemands: [
          {
            demand: "determine the central idea of an informational text",
            lessonPhase: "Close Read",
            domain: "reading",
            difficultyReason: "Requires synthesizing multiple details across paragraphs.",
          },
          {
            demand: "write a short response using text evidence",
            lessonPhase: "Assessment",
            domain: "writing",
            difficultyReason: "Requires organizing ideas and citing support from the text.",
          },
        ],
        accessibilityFlags: [
          {
            issue: "Students must shift between reading, annotation, discussion, and writing.",
            whyItMattersForDifferentiation: "This increases executive function load and may require chunking or visual supports.",
          },
        ],
      };

      const resp: ClaudeLikeResponse = {
        content: [{ type: "text", text: JSON.stringify(payload) }],
      };
      return resp;
    });

    const rawLesson = `Title: The Dust Bowl\nGrade: 7\n...`;
    const result = await extractLessonModel(rawLesson);

    console.assert(result.title === "The Dust Bowl", "title should match");
    console.assert(
      Array.isArray(result.lessonPhases) && result.lessonPhases[0]?.questions?.[0]?.questionType === "central_idea",
      "lessonPhases should preserve typed questions"
    );
    console.assert(
      Array.isArray(result.instructionalDemands) &&
        result.instructionalDemands.some((demand) => demand.domain === "reading" && demand.lessonPhase === "Close Read"),
      "instructionalDemands should include a structured reading demand for Close Read"
    );

    setClaudeCallerForTests(async () => ({
      content: [
        {
          type: "text",
          text: '{"lessonPhases":[{"name":"Close Read"} {"name":"Assessment"}]}',
        },
      ],
    }));

    let malformedJsonError: unknown = null;
    try {
      await extractLessonModel(rawLesson);
    } catch (error) {
      malformedJsonError = error;
    }

    console.assert(malformedJsonError instanceof Error, "malformed JSON should throw an error");
    console.assert(
      malformedJsonError instanceof Error && malformedJsonError.message.includes("Claude returned malformed JSON"),
      "malformed JSON error should clearly describe the parse failure"
    );

    console.log("extractLessonModel.test.ts PASS");
  } finally {
    // Reset mock
    setClaudeCallerForTests(null);
  }
}

main().catch((err) => {
  console.error("extractLessonModel.test.ts FAIL", err);
  process.exit(1);
});
