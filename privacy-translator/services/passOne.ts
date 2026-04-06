import OpenAI from "openai";
import { PASS_ONE_SYSTEM } from "../prompts/passOneSystem";
import { getCorpus } from "../corpus";
import type { Clause, Jurisdiction } from "../types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [
      { role: "system", content: PASS_ONE_SYSTEM },
      { role: "user", content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI in pass one");
  }

  try {
    return JSON.parse(content) as PassOneOutput;
  } catch {
    throw new Error(`Failed to parse pass one JSON response: ${content.slice(0, 200)}`);
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
