import gdprData from "./gdpr.json";
import ccpaData from "./ccpa.json";
import type { CorpusEntry, Jurisdiction } from "../types";

export const GDPR_VERSION = "GDPR 2016/679";
export const CCPA_VERSION = "CCPA as amended by CPRA 2023";

export const gdpr: CorpusEntry[] = gdprData as CorpusEntry[];
export const ccpa: CorpusEntry[] = ccpaData as CorpusEntry[];

export function getCorpus(jurisdiction: Jurisdiction): CorpusEntry[] {
  switch (jurisdiction) {
    case "GDPR":
      return gdpr;
    case "CCPA":
      return ccpa;
    default:
      throw new Error(`Unknown jurisdiction: ${jurisdiction}`);
  }
}
