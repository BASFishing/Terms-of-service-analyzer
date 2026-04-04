import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import { extractTextFromBuffer, detectFormat } from "../services/documentExtractor";
import { runPassOne, passOneOutputToClauses } from "../services/passOne";
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
    return res.status(400).json({ error: "Failed to parse request" });
  }

  const jurisdictionField = fields.jurisdiction;
  const jurisdiction = (
    Array.isArray(jurisdictionField) ? jurisdictionField[0] : jurisdictionField
  ) as Jurisdiction;

  if (!jurisdiction || !["GDPR", "CCPA"].includes(jurisdiction)) {
    return res.status(400).json({ error: "Invalid jurisdiction" });
  }

  let text = "";
  let documentName = "pasted-text";

  // Paste path: text sent directly as a form field
  const pastedText = fields.text;
  const rawText = Array.isArray(pastedText) ? pastedText[0] : pastedText;

  if (rawText && rawText.trim().length > 0) {
    text = rawText.trim();
  } else {
    // File upload path
    const fileField = files.file;
    const uploadedFile = Array.isArray(fileField) ? fileField[0] : fileField;

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file or text provided" });
    }

    const filename = (uploadedFile as File).originalFilename ?? "document";
    documentName = filename;
    const format = detectFormat(filename);
    const buffer = fs.readFileSync((uploadedFile as File).filepath);

    try {
      text = await extractTextFromBuffer(buffer, format);
    } catch (err) {
      return res.status(422).json({ error: `Could not extract text: ${(err as Error).message}` });
    }
  }

  if (!text || text.trim().length < 50) {
    return res.status(422).json({ error: "Document appears to be empty or too short to analyze" });
  }

  try {
    const passOneOutput = await runPassOne(text, jurisdiction);
    const clauseMappings = passOneOutputToClauses(passOneOutput);
    const rights = await runPassTwo(clauseMappings, jurisdiction);

    const result: AnalysisResult = {
      jurisdiction,
      documentName,
      analyzedAt: new Date().toISOString(),
      rights,
      disclaimer: DISCLAIMER_TEXT,
    };

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Analysis failed: ${(err as Error).message}` });
  }
}
