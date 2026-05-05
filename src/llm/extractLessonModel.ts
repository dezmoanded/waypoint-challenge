/*
  Claude Lesson Extractor Helper (Node/TypeScript)

  NOTE: This helper depends on @anthropic-ai/sdk.
  - Install: npm install @anthropic-ai/sdk
  - Env var: export ANTHROPIC_API_KEY=your_key_here

  Minimal usage example:

    import { extractLessonModel } from "./src/llm/extractLessonModel";

    (async () => {
      const rawLesson = `Title: The Dust Bowl\nGrade: 7\n...`;
      const result = await extractLessonModel(rawLesson, {
        model: "claude-3-5-sonnet-20241022",
        maxOutputTokens: 8192,
      });
      console.log(JSON.stringify(result, null, 2));
    })();
*/

import { callClaudeJson, LlmOptions } from "./shared.js";

export type LessonModel = {
  title?: string;
  unit?: string;
  grade?: string;
  sourceTextTitle?: string;
  author?: string;
  textType?: "informational" | "literary" | "poetry" | "mixed" | "unknown";
  standard?: string;
  skillFocus?: string;
  knowledgeFocus?: string;
  vocabulary?: VocabularyTerm[];
  pacing?: LessonPacing[];
  lessonPhases?: LessonPhase[];
  assessments?: AssessmentTask[];
  discussionTasks?: DiscussionTask[];
  instructionalDemands?: InstructionalDemand[];
  accessibilityFlags?: AccessibilityFlag[];
};

export type VocabularyTerm = {
  term: string;
  studentFriendlyDefinition?: string;
  appearsInLesson?: boolean;
};

export type LessonPacing = {
  phase: string;
  minutes?: number;
  description: string;
};

export type LessonPhase = {
  name: string;
  modality?: "whole_class" | "partner" | "independent" | "small_group" | "teacher_led" | "mixed";
  studentTasks: string[];
  teacherMoves?: string[];
  questions?: LessonQuestion[];
};

export type LessonQuestion = {
  text: string;
  questionType?: "literal" | "inferential" | "vocabulary" | "central_idea" | "evidence" | "discussion" | "writing";
  isOptionalSupport?: boolean;
  expectedResponse?: string;
};

export type AssessmentTask = {
  type: "multiple_choice" | "short_response" | "discussion" | "written_response" | "other";
  prompt?: string;
  standard?: string;
  studentOutput: string;
  successCriteria?: string[];
};

export type DiscussionTask = {
  prompt: string;
  expectedStudentAction: string;
};

export type InstructionalDemand = {
  demand: string;
  lessonPhase?: string;
  domain: "reading" | "writing" | "vocabulary" | "discussion" | "assessment" | "executive_function" | "behavioral";
  difficultyReason?: string;
};

export type AccessibilityFlag = {
  issue: string;
  whyItMattersForDifferentiation: string;
};

export type ExtractOptions = LlmOptions;

const PROMPT_HEADER = `
Extract a structured lesson model from this curriculum document.

Focus on what the student is being asked to do, phase by phase. Return JSON only.

Return this exact shape:

{
  "title": "",
  "unit": "",
  "grade": "",
  "sourceTextTitle": "",
  "author": "",
  "textType": "informational | literary | poetry | mixed | unknown",
  "standard": "",
  "skillFocus": "",
  "knowledgeFocus": "",
  "vocabulary": [
    {
      "term": "",
      "studentFriendlyDefinition": "",
      "appearsInLesson": true
    }
  ],
  "pacing": [
    {
      "phase": "",
      "minutes": 0,
      "description": ""
    }
  ],
  "lessonPhases": [
    {
      "name": "",
      "modality": "whole_class | partner | independent | small_group | teacher_led | mixed",
      "studentTasks": [],
      "teacherMoves": [],
      "questions": [
        {
          "text": "",
          "questionType": "literal | inferential | vocabulary | central_idea | evidence | discussion | writing",
          "isOptionalSupport": false,
          "expectedResponse": ""
        }
      ]
    }
  ],
  "assessments": [
    {
      "type": "multiple_choice | short_response | discussion | written_response | other",
      "prompt": "",
      "standard": "",
      "studentOutput": "",
      "successCriteria": []
    }
  ],
  "discussionTasks": [
    {
      "prompt": "",
      "expectedStudentAction": ""
    }
  ],
  "instructionalDemands": [
    {
      "demand": "",
      "lessonPhase": "",
      "domain": "reading | writing | vocabulary | discussion | assessment | executive_function | behavioral",
      "difficultyReason": ""
    }
  ],
  "accessibilityFlags": [
    {
      "issue": "",
      "whyItMattersForDifferentiation": ""
    }
  ]
}

Rules:
- Do not invent lesson content.
- Preserve exact lesson questions when available.
- Include teacher-copy expected answers only if present in the document.
- For instructionalDemands, infer concrete student-facing demands.
- For accessibilityFlags, identify likely barriers created by the lesson format, not by any specific student IEP.
- Keep the model concise but specific.
`;

export async function extractLessonModel(
  rawLessonText: string,
  options: ExtractOptions = {}
): Promise<LessonModel> {
  const userText = `${PROMPT_HEADER}\n\nCurriculum document (raw):\n\n${rawLessonText}`;
  const json = await callClaudeJson<LessonModel>(userText, {
    maxOutputTokens: options.maxOutputTokens ?? 8192,
    ...options,
  });
  return json;
}
