import { extractRawPdfText, findHeadingMatch } from "./shared.js";

export type IepSectionKey =
  | "studentAndParentConcerns"
  | "studentVision"
  | "studentProfile"
  | "presentLevelsAcademics"
  | "presentLevelsBehavioralSocialEmotional"
  | "presentLevelsCommunication"
  | "presentLevelsAdditionalAreas"
  | "accommodationsAndModifications"
  | "measurableAnnualGoals"
  | "participationGeneralEducation"
  | "serviceDelivery"
  | "assessmentsAndAccommodations"
  | "scheduleModification"
  | "additionalInformation"
  | "placement";

export type IepSections = Record<IepSectionKey, string> & { rawText: string };

export const HEADINGS: Array<[IepSectionKey, string]> = [
  ["studentAndParentConcerns", "STUDENT AND PARENT CONCERNS"],
  ["studentVision", "STUDENT AND TEAM VISION"],
  ["studentProfile", "STUDENT PROFILE"],
  [
    "presentLevelsAcademics",
    "PRESENT LEVELS OF ACADEMIC ACHIEVEMENT AND FUNCTIONAL PERFORMANCE: ACADEMICS"
  ],
  [
    "presentLevelsBehavioralSocialEmotional",
    "PRESENT LEVELS OF ACADEMIC ACHIEVEMENT AND FUNCTIONAL PERFORMANCE: BEHAVIORAL/SOCIAL/EMOTIONAL"
  ],
  [
    "presentLevelsCommunication",
    "PRESENT LEVELS OF ACADEMIC ACHIEVEMENT AND FUNCTIONAL PERFORMANCE: COMMUNICATION"
  ],
  [
    "presentLevelsAdditionalAreas",
    "PRESENT LEVELS OF ACADEMIC ACHIEVEMENT AND FUNCTIONAL PERFORMANCE: ADDITIONAL AREAS"
  ],
  ["accommodationsAndModifications", "ACCOMMODATIONS AND MODIFICATIONS"],
  ["measurableAnnualGoals", "MEASURABLE ANNUAL GOALS"],
  ["participationGeneralEducation", "Participation in the General Education Setting"],
  ["serviceDelivery", "SERVICE DELIVERY"],
  ["assessmentsAndAccommodations", "State and District-Wide Assessments and Accommodations"],
  ["scheduleModification", "SCHEDULE MODIFICATION"],
  ["additionalInformation", "ADDITIONAL INFORMATION"],
  ["placement", "Placement Consent Form"]
];

function extractSection(text: string, start: string, endCandidates: string[]): string {
  const startMatch = findHeadingMatch(text, start);
  if (!startMatch) return "";

  const afterStart = startMatch.index + startMatch[0].length;
  const endIndexes = endCandidates
    .map((heading) => findHeadingMatch(text, heading, afterStart))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => match.index);

  const endIndex = endIndexes.length ? Math.min(...endIndexes) : text.length;
  return text.slice(afterStart, endIndex).trim();
}

export async function extractIepSections(pdfPath: string): Promise<IepSections> {
  const rawText = await extractRawPdfText(pdfPath);

  const sections = Object.fromEntries(
    HEADINGS.map(([key, heading], index) => {
      const endCandidates = HEADINGS.slice(index + 1).map(([, nextHeading]) => nextHeading);
      return [key, extractSection(rawText, heading, endCandidates)];
    })
  ) as Record<IepSectionKey, string>;

  return {
    ...sections,
    rawText
  };
}

async function main(): Promise<void> {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error("Usage: tsx src/pdf/extractIepSections.ts <path-to-pdf>");
    process.exit(1);
  }

  const result = await extractIepSections(pdfPath);
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
