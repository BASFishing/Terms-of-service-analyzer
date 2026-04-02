import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import { performOCR } from "../services/ocrService";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface OcrResponse {
  text?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OcrResponse>
): Promise<void> {
  if (req.method !== "POST") {
    return void res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });

  let fields: formidable.Fields;
  let files: formidable.Files;

  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    return void res.status(400).json({ error: `Failed to parse form: ${(err as Error).message}` });
  }

  const fileField = files.file;
  const uploadedFile: File | undefined = Array.isArray(fileField) ? fileField[0] : fileField;

  if (!uploadedFile) {
    return void res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const buffer = fs.readFileSync(uploadedFile.filepath);
    const text = await performOCR(buffer);
    return void res.status(200).json({ text });
  } catch (err) {
    return void res.status(500).json({ error: (err as Error).message });
  }
}
