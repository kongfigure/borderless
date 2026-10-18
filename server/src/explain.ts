import { generate } from "./llm.js";
import type { TrustVerdictResult } from "../../shared/types.js";

export interface ExplanationResult {
  explanation: string;
  source: "live" | "fallback";
}

function fallbackExplanation(result: TrustVerdictResult): string {
  const lead = result.signals[0]?.reason;
  switch (result.verdict) {
    case "looks_good":
      return lead
        ? `This listing looks good: ${lead}`
        : "This listing looks good based on its public signals.";
    case "skip":
      return lead ? `We'd skip this one: ${lead}` : "We'd skip this listing based on its public signals.";
    case "not_enough_info":
    default:
      return lead
        ? `Not enough info yet: ${lead}`
        : "There isn't enough public information to judge this listing yet.";
  }
}

/** Calls Claude with ONLY the structured verdict and signals — never raw
 * listing text — to produce one plain-English sentence. Falls back to a
 * template sentence built from the signals if the key is missing, the cost
 * cap is reached, or the call fails. */
export async function explainVerdict(result: TrustVerdictResult): Promise<ExplanationResult> {
  const response = await generate({
    maxTokens: 60,
    prompt: `You are explaining a shopping trust verdict to a shopper. Given ONLY this structured data, write ONE concise, plain-English sentence explaining the verdict. Be direct and honest; this is a guide, not proof.\n\nVerdict: ${result.verdict}\nSignals: ${JSON.stringify(result.signals)}`,
  });

  if (!response) {
    return { explanation: fallbackExplanation(result), source: "fallback" };
  }
  return { explanation: response.text, source: "live" };
}
