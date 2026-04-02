const OCR_SERVICE_URL =
  process.env.OCR_SERVICE_URL ?? "https://api.ocr-service.example.com";
const OCR_SERVICE_KEY = process.env.OCR_SERVICE_KEY ?? "";

export async function performOCR(buffer: Buffer): Promise<string> {
  if (!OCR_SERVICE_KEY) {
    throw new Error(
      "OCR_SERVICE_KEY is not configured. Set it in your environment variables."
    );
  }

  const response = await fetch(`${OCR_SERVICE_URL}/extract`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OCR_SERVICE_KEY}`,
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OCR service returned ${response.status}: ${body}`);
  }

  const result = (await response.json()) as { text: string };
  return result.text ?? "";
}
