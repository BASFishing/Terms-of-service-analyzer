import { extractText as extractPdfText } from "./pdfExtractor";

// mammoth is used for .docx extraction
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require("mammoth") as {
  extractRawText: (input: { buffer: Buffer }) => Promise<{ value: string }>;
};

export type SupportedFormat = "pdf" | "docx" | "md" | "txt" | "text";

export function detectFormat(filename: string): SupportedFormat {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":  return "pdf";
    case "docx": return "docx";
    case "md":   return "md";
    case "txt":  return "txt";
    default:     return "txt"; // fallback: treat as plain text
  }
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  format: SupportedFormat
): Promise<string> {
  switch (format) {
    case "pdf":
      return extractPdfText(buffer);

    case "docx": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value ?? "";
    }

    case "md":
    case "txt":
      return buffer.toString("utf-8");

    default:
      return buffer.toString("utf-8");
  }
}
