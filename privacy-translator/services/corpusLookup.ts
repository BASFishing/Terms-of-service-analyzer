import { getCorpus } from "../corpus";
import type { CorpusEntry, Jurisdiction } from "../types";

export function getCorpusEntry(
  rightKey: string,
  jurisdiction: Jurisdiction
): CorpusEntry | undefined {
  const corpus = getCorpus(jurisdiction);
  return corpus.find((entry) => entry.key === rightKey);
}
