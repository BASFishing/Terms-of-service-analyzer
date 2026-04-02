import Anthropic from "@anthropic-ai/sdk";
import { PASS_ONE_SYSTEM } from "../prompts/passOneSystem";
import { getCorpus } from "../corpus";
import type { Clause, Jurisdiction } from "../types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface PassOneOutput {
  mappings: Record<string, Array<{ text: string; pageNumber: number | null }>>;
}

export async function runPassOne(
  extractedText: string,
  jurisdiction: Jurisdiction
): Promise<PassOneOutput> {
  const corpus = getCorpus(jurisdiction);
  const rightKeys = corpus.map((e) => e.key);

  const userMessage = `
JURISDICTION: ${jurisdiction}
RIGHT KEYS: ${rightKeys.join(", ")}

DOCUMENT TEXT:
${extractedText}
`.trim();

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: PASS_ONE_SYSTEM,
    messages: [{ role: "user", content: userMessage }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude in pass one");
  }

  try {
    return JSON.parse(content.text) as PassOneOutput;
  } catch {
    throw new Error(`Failed to parse pass one JSON response: ${content.text.slice(0, 200)}`);
  }
}

export function passOneOutputToClauses(output: PassOneOutput): Record<string, Clause[]> {
  const result: Record<string, Clause[]> = {};
  for (const [rightKey, rawClauses] of Object.entries(output.mappings)) {
    result[rightKey] = rawClauses.map((c) => ({
      rightKey,
      text: c.text,
      pageNumber: c.pageNumber ?? undefined,
    }));
  }
  return result;
}
