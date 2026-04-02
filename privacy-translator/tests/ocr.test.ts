import { isScanned, extractText } from "../services/pdfExtractor";

jest.mock("../services/pdfExtractor", () => ({
  extractText: jest.fn(),
  isScanned: jest.requireActual("../services/pdfExtractor").isScanned,
}));

describe("isScanned detection", () => {
  it("returns true for very short extracted text (likely scanned)", () => {
    expect(isScanned("")).toBe(true);
    expect(isScanned("   ")).toBe(true);
    expect(isScanned("ab")).toBe(true);
  });

  it("returns false for normal text-based PDF content", () => {
    const normalText = "This Privacy Policy describes how we collect and use your personal information. ".repeat(20);
    expect(isScanned(normalText)).toBe(false);
  });

  it("uses 100-character threshold", () => {
    const shortText = "x".repeat(99);
    const longText = "x".repeat(100);
    expect(isScanned(shortText)).toBe(true);
    expect(isScanned(longText)).toBe(false);
  });
});

describe("extractText", () => {
  it("is called with a buffer", async () => {
    (extractText as jest.Mock).mockResolvedValue("extracted text from pdf");
    const buffer = Buffer.from("fake pdf content");
    const result = await extractText(buffer);
    expect(extractText).toHaveBeenCalledWith(buffer);
    expect(result).toBe("extracted text from pdf");
  });
});
