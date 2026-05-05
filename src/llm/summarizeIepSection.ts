/*
  IEP Section Summarizer (Node/TypeScript)

  Uses Claude to create a structured, teacher-facing summary for a single IEP section.
  - Depends on: @anthropic-ai/sdk (via shared.ts)
  - Env var: export ANTHROPIC_API_KEY=your_key_here

  Minimal usage example:

    import { summarizeIepSection } from "./src/llm/summarizeIepSection";

    (async () => {
      const result = await summarizeIepSection(
        "Accommodations",
        "Student receives extended time (1.5x) and small-group testing..."
      );
      console.log(JSON.stringify(result, null, 2));
    })();
*/

import { callClaudeJson, LlmOptions } from "./shared.js";

export type IepSectionSummary = {
  section: string;
  title: string;
  summary: string;
  keyFacts: string[];
  instructionalImplications: string[];
  teacherSupports: string[];
  risksOrWatchFors: string[];
  exactLookupRecommendedFor: string[];
};

// Prompt (verbatim as specified)
const IEPSUMMARY_PROMPT =
  `You are summarizing one section of an Individualized Education Program (IEP) for a teacher-facing lesson differentiation tool.  Your goal is to preserve only information that helps a teacher modify instruction, classroom activities, assessments, participation expectations, or supports.  Return JSON only. Do not include markdown.  Section name: {{sectionName}}  Raw IEP section text: {{sectionText}}  Return this exact shape:  {   "section": "{{sectionName}}",   "title": "",   "summary": "",   "keyFacts": [],   "instructionalImplications": [],   "teacherSupports": [],   "risksOrWatchFors": [],   "exactLookupRecommendedFor": [] }  Rules: - Keep the summary short: 2-4 sentences. - keyFacts should be factual statements from the IEP section. - instructionalImplications should explain what this means for lesson modification. - teacherSupports should include concrete supports mentioned or strongly implied by this section. - risksOrWatchFors should include things the teacher should watch for during instruction. - exactLookupRecommendedFor should list cases where Claude should call get_iep_section for the raw section. - Do not invent diagnoses, needs, services, or accommodations. - Do not include unnecessary personal/contact information. - Preserve useful quantitative details, such as grade levels, percentages, frequencies, dates, or goals. - If the section is empty or not instructionally useful, return empty arrays and a short summary explaining that.`;

export async function summarizeIepSection(
  sectionName: string,
  sectionText: string,
  options: LlmOptions = {}
): Promise<IepSectionSummary> {
  const userText = IEPSUMMARY_PROMPT
    .replace(/\{\{sectionName\}\}/g, sectionName)
    .replace(/\{\{sectionText\}\}/g, sectionText);

  const json = await callClaudeJson<IepSectionSummary>(userText, options);
  return json;
}
