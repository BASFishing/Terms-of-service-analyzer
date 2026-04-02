import pdfParse from "pdf-parse";

const SCANNED_TEXT_THRESHOLD = 100; // characters — below this we treat the PDF as scanned

export async function extractText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text ?? "";
  } catch (err) {
    throw new Error(`Failed to extract text from PDF: ${(err as Error).message}`);
  }
}

export function isScanned(text: string): boolean {
  return text.trim().length < SCANNED_TEXT_THRESHOLD;
}
