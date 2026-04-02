import Anthropic from "@anthropic-ai/sdk";
import { PASS_TWO_SYSTEM } from "../prompts/passTwoSystem";
import { getCorpusEntry } from "./corpusLookup";
import type { Clause, ConfidenceLevel, Jurisdiction, RightAnalysis } from "../types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
  // Build corpus context to include in the prompt
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

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: PASS_TWO_SYSTEM,
    messages: [{ role: "user", content: userMessage }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude in pass two");
  }

  let parsed: PassTwoOutput;
  try {
    parsed = JSON.parse(content.text) as PassTwoOutput;
  } catch {
    throw new Error(`Failed to parse pass two JSON response: ${content.text.slice(0, 200)}`);
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
