import { extractIepSections, HEADINGS } from "../../pdf/extractIepSections.js";
import { summarizeIepSection, IepSectionSummary } from "../../llm/summarizeIepSection.js";

export const IEP_SUMMARY_RESOURCE = {
  name: "iep-summary",
  uri: "iep://summary",
  metadata: {
    title: "IEP Section Summaries",
    description:
      "Summaries for major IEP sections (strengths/needs/goals/accommodations/etc.) produced via PDF parsing and LLM summarization.",
    mimeType: "application/json",
  },
  async read() {
    const pdfPath = process.env.IEP_PDF_PATH || "iep.pdf";

    // 1) Parse the IEP PDF into structured sections
    const sections = await extractIepSections(pdfPath);

    // 2) For each section, call the LLM summarizer in parallel (best-effort)
    const tasks = HEADINGS.map(async ([key, heading]) => {
      const sectionText = sections[key] || "";
      if (!sectionText || sectionText.trim().length === 0) {
        const empty: IepSectionSummary = {
          section: heading,
          title: heading,
          summary: "Section was empty or not detected in the source PDF.",
          keyFacts: [],
          instructionalImplications: [],
          teacherSupports: [],
          risksOrWatchFors: [],
          exactLookupRecommendedFor: [],
        };
        return { key, heading, summary: empty, error: null as string | null };
      }

      try {
        const summary = await summarizeIepSection(heading, sectionText);
        return { key, heading, summary, error: null as string | null };
      } catch (err: any) {
        return {
          key,
          heading,
          summary: null as unknown as IepSectionSummary,
          error: err?.message || String(err),
        };
      }
    });

    const settled = await Promise.allSettled(tasks);

    const results = settled.map((r, i) => {
      const [key, heading] = HEADINGS[i];
      if (r.status === "fulfilled") return r.value;
      return {
        key,
        heading,
        summary: null as unknown as IepSectionSummary,
        error: r.reason?.message || String(r.reason),
      };
    });

    const payload = {
      source: { pdfPath },
      generatedAt: new Date().toISOString(),
      sections: results,
    };

    return {
      contents: [
        {
          uri: "iep://summary",
          mimeType: "application/json",
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  },
} as const;
