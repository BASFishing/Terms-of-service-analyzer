import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import { extractText, isScanned } from "../services/pdfExtractor";
import { performOCR } from "../services/ocrService";
import { runPassOne } from "../services/passOne";
import { runPassTwo } from "../services/passTwo";
import type { AnalysisResult, Jurisdiction } from "../types";
import { DISCLAIMER_TEXT } from "../prompts/disclaimer";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });

  let fields: formidable.Fields;
  let files: formidable.Files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    return res.status(400).json({ error: "Failed to parse upload" });
  }

  const fileField = files.file;
  const uploadedFile = Array.isArray(fileField) ? fileField[0] : fileField;
  if (!uploadedFile) return res.status(400).json({ error: "No file uploaded" });

  const jurisdictionField = fields.jurisdiction;
  const jurisdiction = (Array.isArray(jurisdictionField) ? jurisdictionField[0] : jurisdictionField) as Jurisdiction;
  if (!jurisdiction || !["GDPR", "CCPA"].includes(jurisdiction)) {
    return res.status(400).json({ error: "Invalid jurisdiction" });
  }

  const buffer = fs.readFileSync((uploadedFile as File).filepath);
  let text = await extractText(buffer);

  if (isScanned(text)) {
    text = await performOCR(buffer);
  }

  const passOneOutput = await runPassOne(text, jurisdiction);
  const rights = await runPassTwo(passOneOutput, jurisdiction);

  const result: AnalysisResult = {
    jurisdiction,
    documentName: (uploadedFile as File).originalFilename ?? "document.pdf",
    analyzedAt: new Date().toISOString(),
    rights,
    disclaimer: DISCLAIMER_TEXT,
  };

  return res.status(200).json(result);
}
