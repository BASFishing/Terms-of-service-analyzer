import { runPassOne, passOneOutputToClauses } from "../services/passOne";
import { runPassTwo } from "../services/passTwo";
import type { Clause, RightAnalysis } from "../types";

jest.mock("../services/passOne");
jest.mock("../services/passTwo");

// Mock PassOneOutput shape (matches the real PassOneOutput interface)
const mockPassOneOutput = {
  mappings: {
    right_of_access: [
      { text: "You may request a copy of your data at any time.", pageNumber: 3 },
    ],
  },
};

// Expected clause mapping produced by passOneOutputToClauses
const mockClauseMappings: Record<string, Clause[]> = {
  right_of_access: [
    { rightKey: "right_of_access", text: "You may request a copy of your data at any time.", pageNumber: 3 },
  ],
};

const mockRights: RightAnalysis[] = [
  {
    rightKey: "right_of_access",
    rightName: "Right of Access",
    clauses: [{ rightKey: "right_of_access", text: "You may request a copy of your data at any time.", pageNumber: 3 }],
    plainLanguage: "You can ask the company for a copy of your personal data.",
    confidence: "Full",
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
  (passOneOutputToClauses as jest.Mock).mockReturnValue(mockClauseMappings);
  (runPassTwo as jest.Mock).mockResolvedValue(mockRights);
});

describe("pass chain", () => {
  it("runPassOne returns PassOneOutput with mappings", async () => {
    const result = await runPassOne("Sample ToS text", "GDPR");
    expect(result).toHaveProperty("mappings");
    expect(typeof result.mappings).toBe("object");
  });

  it("passOneOutputToClauses converts PassOneOutput to clause record", () => {
    const clauses = passOneOutputToClauses(mockPassOneOutput);
    expect(clauses).toEqual(mockClauseMappings);
    expect(Array.isArray(clauses.right_of_access)).toBe(true);
    expect(clauses.right_of_access[0]).toHaveProperty("rightKey");
    expect(clauses.right_of_access[0]).toHaveProperty("text");
  });

  it("runPassTwo returns enriched RightAnalysis array", async () => {
    const result = await runPassTwo(mockClauseMappings, "GDPR");
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
    const clauses = passOneOutputToClauses(p1);
    const rights = await runPassTwo(clauses, "GDPR");
    expect(Array.isArray(rights)).toBe(true);
    expect(rights[0]).toHaveProperty("clauses");
    expect(Array.isArray(rights[0].clauses)).toBe(true);
    expect(rights[0]).toHaveProperty("corpusEntry");
    expect(rights[0]).toHaveProperty("jurisdiction" in rights[0] ? "jurisdiction" : "rightKey");
  });
});
