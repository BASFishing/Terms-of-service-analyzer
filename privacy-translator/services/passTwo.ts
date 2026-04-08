import OpenAI from "openai";
import { PASS_TWO_SYSTEM } from "../prompts/passTwoSystem";
import { getCorpusEntry } from "./corpusLookup";
import type { Clause, ConfidenceLevel, Jurisdiction, RightAnalysis } from "../types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PassTwoEnrichedEntry {
  plainLanguage: string;
  gap: string | null;
  confidence: ConfidenceLevel;
}

interface PassTwoOutput {
  enriched: Record<string, PassTwoEnrichedEntry>;
}

export async function runPassTwo(
  clauseMappings: Record<string, Clause[]>,
  jurisdiction: Jurisdiction
): Promise<RightAnalysis[]> {
  const corpusContext: Record<string, { name: string; verbatimText: string }> = {};
  for (const rightKey of Object.keys(clauseMappings)) {
    const entry = getCorpusEntry(rightKey, jurisdiction);
    if (entry) {
      corpusContext[rightKey] = { name: entry.name, verbatimText: entry.verbatimText };
    }
  }

  const userMessage = `
JURISDICTION: ${jurisdiction}

CORPUS CONTEXT:
${JSON.stringify(corpusContext, null, 2)}

CLAUSE MAPPINGS FROM PASS 1:
${JSON.stringify(clauseMappings, null, 2)}
`.trim();

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [
      { role: "system", content: PASS_TWO_SYSTEM },
      { role: "user", content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI in pass two");
  }

  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  let parsed: PassTwoOutput;
  try {
    parsed = JSON.parse(cleaned) as PassTwoOutput;
  } catch {
    throw new Error(`Failed to parse pass two JSON response: ${content.slice(0, 200)}`);
  }

  const results: RightAnalysis[] = [];

  for (const [rightKey, enriched] of Object.entries(parsed.enriched)) {
    const corpusEntry = getCorpusEntry(rightKey, jurisdiction);
    if (!corpusEntry) continue;

    results.push({
      rightKey,
      rightName: corpusEntry.name,
      clauses: clauseMappings[rightKey] ?? [],
      plainLanguage: enriched.plainLanguage,
      confidence: enriched.confidence,
      gap: enriched.gap,
      corpusEntry,
    });
  }

  return results;
}
