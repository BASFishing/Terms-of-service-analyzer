import gdpr from "../corpus/gdpr.json";
import ccpa from "../corpus/ccpa.json";

const REQUIRED_FIELDS = ["key", "name", "verbatimText", "version"];

describe("GDPR corpus", () => {
  it("has exactly 11 rights", () => {
    expect(gdpr.rights).toHaveLength(11);
  });

  it("each entry has required fields", () => {
    for (const entry of gdpr.rights) {
      for (const field of REQUIRED_FIELDS) {
        expect(entry).toHaveProperty(field);
        expect((entry as Record<string, unknown>)[field]).toBeTruthy();
      }
    }
  });

  it("all keys are unique", () => {
    const keys = gdpr.rights.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("CCPA corpus", () => {
  it("has exactly 11 rights", () => {
    expect(ccpa.rights).toHaveLength(11);
  });

  it("each entry has required fields", () => {
    for (const entry of ccpa.rights) {
      for (const field of REQUIRED_FIELDS) {
        expect(entry).toHaveProperty(field);
        expect((entry as Record<string, unknown>)[field]).toBeTruthy();
      }
    }
  });

  it("all keys are unique", () => {
    const keys = ccpa.rights.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
