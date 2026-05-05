import fs from "node:fs/promises";
import pdf from "pdf-parse";

export function normalizePdfText(text: string): string {
  return text
    .replace(/grade[\uFFFE\uFEFF]level/gi, "grade-level")
    .replace(/[\uFFFE\uFEFF]/g, "-")
    .replace(/(\w)[\uFFFE\uFEFF](\w)/g, "$1-$2")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractRawPdfText(pdfPath: string): Promise<string> {
  const buffer = await fs.readFile(pdfPath);
  const parsed = await pdf(buffer);
  return normalizePdfText(parsed.text ?? "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function headingToPattern(heading: string): RegExp {
  const pattern = heading
    .trim()
    .split(/\s+/)
    .map((part) => escapeRegExp(part))
    .join("\\s+");

  return new RegExp(pattern, "i");
}

export function findHeadingMatch(text: string, heading: string, fromIndex = 0): RegExpExecArray | null {
  const regex = headingToPattern(heading);
  const slice = text.slice(fromIndex);
  const match = regex.exec(slice);

  if (!match || match.index === undefined) {
    return null;
  }

  match.index += fromIndex;
  return match;
}
