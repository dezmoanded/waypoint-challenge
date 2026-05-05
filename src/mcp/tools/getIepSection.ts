import { z } from "zod";
import {
  extractIepSections as extractIepSectionsReal,
  HEADINGS,
} from "../../pdf/extractIepSections.js";
import { findHeadingMatch } from "../../pdf/shared.js";

// Allow tests to inject a mock extractIepSections
let extractIepSectionsImpl = extractIepSectionsReal;
export function setExtractIepSectionsForTests(
  fn: typeof extractIepSectionsReal | null,
) {
  extractIepSectionsImpl = fn ?? extractIepSectionsReal;
}

// Build input schema as a Zod object for MCP tool registration
const inputSchema = z.object({
  section: z
    .string()
    .min(1)
    .describe(
      "Requested IEP section identifier or heading (e.g., measurableAnnualGoals, ACCOMMODATIONS AND MODIFICATIONS).",
    ),
  goalId: z
    .string()
    .optional()
    .describe(
      "Optional goal identifier or phrase to locate within the 'MEASURABLE ANNUAL GOALS' section.",
    ),
});

// Helper to find the section match by key or heading text (case-insensitive, allows partial heading match)
function resolveSection(sectionQuery: string):
  | { key: (typeof HEADINGS)[number][0]; heading: string; index: number }
  | null {
  const q = sectionQuery.trim().toLowerCase();

  // Exact key match
  const byKeyIdx = HEADINGS.findIndex(([key]) => key.toLowerCase() === q);
  if (byKeyIdx !== -1) {
    const [key, heading] = HEADINGS[byKeyIdx];
    return { key, heading, index: byKeyIdx } as any;
  }

  // Exact heading match
  const byHeadingIdx = HEADINGS.findIndex(([, heading]) => heading.toLowerCase() === q);
  if (byHeadingIdx !== -1) {
    const [key, heading] = HEADINGS[byHeadingIdx];
    return { key, heading, index: byHeadingIdx } as any;
  }

  // Partial heading match
  const partialIdx = HEADINGS.findIndex(([, heading]) => heading.toLowerCase().includes(q));
  if (partialIdx !== -1) {
    const [key, heading] = HEADINGS[partialIdx];
    return { key, heading, index: partialIdx } as any;
  }

  return null;
}

export const GET_IEP_SECTION_TOOL = {
  name: "get_iep_section",
  config: {
    title: "Get IEP Section",
    description:
      "Return a specific IEP section (with simple provenance) and optionally a goal snippet if goalId is provided.",
    inputSchema,
  },
  async handler({ section, goalId }: { section: string; goalId?: string }) {
    const pdfPath = process.env.IEP_PDF_PATH || "iep.pdf";

    try {
      const match = resolveSection(section);
      if (!match) {
        const contentItem = {
          type: "text" as const,
          text: JSON.stringify(
            {
              status: "not_found",
              args: { section, goalId },
              message:
                "No matching IEP section was found. Try a known key or heading (see HEADINGS in extractIepSections).",
            },
            null,
            2,
          ),
        };
        return { content: [contentItem] };
      }

      const data = await extractIepSectionsImpl(pdfPath);
      const sectionText = (data as any)[match.key] as string;

      // Compute provenance indices in raw text
      const startMatch = findHeadingMatch(data.rawText, match.heading);
      const afterStart = startMatch ? startMatch.index + startMatch[0].length : -1;
      const nextHeading = HEADINGS[match.index + 1]?.[1];
      const endMatch = nextHeading
        ? findHeadingMatch(data.rawText, nextHeading, afterStart === -1 ? 0 : afterStart)
        : null;
      const endIndex = endMatch?.index ?? data.rawText.length;

      // Optional goalId snippet within the measurableAnnualGoals section
      let goalInfo: any = undefined;
      if (goalId && match.key === "measurableAnnualGoals" && sectionText) {
        const hay = sectionText.toLowerCase();
        const needle = goalId.toLowerCase();
        const at = hay.indexOf(needle);
        if (at !== -1) {
          const around = 450;
          const start = Math.max(0, at - around);
          const end = Math.min(sectionText.length, at + needle.length + around);
          goalInfo = {
            found: true,
            index: at,
            snippet: sectionText.slice(start, end),
            snippetStart: start,
            snippetEnd: end,
          };
        } else {
          goalInfo = {
            found: false,
            message: "goalId not found in measurableAnnualGoals; returning full section text",
          };
        }
      }

      const payload = {
        status: "ok",
        args: { section, goalId },
        match: { key: match.key, heading: match.heading },
        provenance: {
          pdfPath,
          heading: match.heading,
          indices: {
            heading: startMatch?.index ?? -1,
            sectionStart: afterStart,
            sectionEnd: endIndex,
          },
        },
        result: {
          sectionText: sectionText ?? "",
          goal: goalInfo,
        },
      };

      const contentItem = {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      };
      return { content: [contentItem] };
    } catch (err: any) {
      const contentItem = {
        type: "text" as const,
        text: JSON.stringify(
          {
            status: "error",
            args: { section, goalId },
            message: err?.message || String(err),
          },
          null,
          2,
        ),
      };
      return { content: [contentItem] };
    }
  },
} as const;
