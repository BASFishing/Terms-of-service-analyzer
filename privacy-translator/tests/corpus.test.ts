import gdpr from "../corpus/gdpr.json";
import ccpa from "../corpus/ccpa.json";

const REQUIRED_FIELDS = ["key", "name", "verbatimText", "version"];

// The JSON files export flat arrays of rights entries
const gdprRights = gdpr as Array<Record<string, unknown>>;
const ccpaRights = ccpa as Array<Record<string, unknown>>;

describe("GDPR corpus", () => {
  it("has exactly 11 rights", () => {
    expect(gdprRights).toHaveLength(11);
  });

  it("each entry has required fields", () => {
    for (const entry of gdprRights) {
      for (const field of REQUIRED_FIELDS) {
        expect(entry).toHaveProperty(field);
        expect(entry[field]).toBeTruthy();
      }
    }
  });

  it("all keys are unique", () => {
    const keys = gdprRights.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("CCPA corpus", () => {
  it("has exactly 11 rights", () => {
    expect(ccpaRights).toHaveLength(11);
  });

  it("each entry has required fields", () => {
    for (const entry of ccpaRights) {
      for (const field of REQUIRED_FIELDS) {
        expect(entry).toHaveProperty(field);
        expect(entry[field]).toBeTruthy();
      }
    }
  });

  it("all keys are unique", () => {
    const keys = ccpaRights.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
