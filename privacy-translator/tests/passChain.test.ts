import { runPassOne } from "../services/passOne";
import { runPassTwo } from "../services/passTwo";

jest.mock("../services/passOne");
jest.mock("../services/passTwo");

const mockPassOneOutput = [
  {
    rightKey: "right_to_access",
    clauses: [{ rightKey: "right_to_access", text: "You may request a copy of your data at any time.", pageNumber: 3 }],
  },
];

const mockRights = [
  {
    rightKey: "right_to_access",
    rightName: "Right of Access",
    clauses: [{ rightKey: "right_to_access", text: "You may request a copy of your data at any time.", pageNumber: 3 }],
    plainLanguage: "You can ask the company for a copy of your personal data.",
    confidence: "Full" as const,
    gap: null,
    corpusEntry: {
      key: "right_of_access",
      name: "Right of Access",
      article: "Article 15",
      verbatimText: "The data subject shall have the right to obtain...",
      version: "GDPR 2016/679",
    },
  },
];

beforeEach(() => {
  (runPassOne as jest.Mock).mockResolvedValue(mockPassOneOutput);
  (runPassTwo as jest.Mock).mockResolvedValue(mockRights);
});

describe("pass chain", () => {
  it("runPassOne returns clause mappings", async () => {
    const result = await runPassOne("Sample ToS text", "GDPR");
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("rightKey");
    expect(result[0]).toHaveProperty("clauses");
  });

  it("runPassTwo returns enriched RightAnalysis array", async () => {
    const result = await runPassTwo(mockPassOneOutput, "GDPR");
    expect(result).toHaveLength(1);
    const right = result[0];
    expect(right).toHaveProperty("rightKey");
    expect(right).toHaveProperty("plainLanguage");
    expect(right).toHaveProperty("confidence");
    expect(right).toHaveProperty("gap");
    expect(right).toHaveProperty("corpusEntry");
    expect(["Low", "Partial", "Full"]).toContain(right.confidence);
  });

  it("full chain produces AnalysisResult-compatible structure", async () => {
    const p1 = await runPassOne("Sample ToS text", "GDPR");
    const rights = await runPassTwo(p1, "GDPR");
    expect(Array.isArray(rights)).toBe(true);
    expect(rights[0]).toHaveProperty("clauses");
    expect(Array.isArray(rights[0].clauses)).toBe(true);
  });
});
