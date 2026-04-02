export type Jurisdiction = "GDPR" | "CCPA";

export type ConfidenceLevel = "Low" | "Partial" | "Full";

export interface CorpusEntry {
  key: string;
  name: string;
  article?: string;
  section?: string;
  verbatimText: string;
  version: string;
}

export interface Clause {
  rightKey: string;
  text: string;
  pageNumber?: number;
}

export interface RightAnalysis {
  rightKey: string;
  rightName: string;
  clauses: Clause[];
  plainLanguage: string;
  confidence: ConfidenceLevel;
  gap: string | null;
  corpusEntry: CorpusEntry;
}

export interface AnalysisResult {
  jurisdiction: Jurisdiction;
  documentName: string;
  analyzedAt: string;
  rights: RightAnalysis[];
  disclaimer: string;
}
