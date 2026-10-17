import Anthropic from "@anthropic-ai/sdk";
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

/** Calls the Anthropic API with ONLY the structured verdict and signals —
 * never raw listing text — to produce one plain-English sentence. Falls
 * back to a template sentence built from the signals if the key is missing
 * or the call fails. */
export async function explainVerdict(result: TrustVerdictResult): Promise<ExplanationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { explanation: fallbackExplanation(result), source: "fallback" };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 60,
      messages: [
        {
          role: "user",
          content: `You are explaining a shopping trust verdict to a shopper. Given ONLY this structured data, write ONE concise, plain-English sentence explaining the verdict. Be direct and honest; this is a guide, not proof.\n\nVerdict: ${result.verdict}\nSignals: ${JSON.stringify(result.signals)}`,
        },
      ],
    });
    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!text) {
      return { explanation: fallbackExplanation(result), source: "fallback" };
    }
    return { explanation: text, source: "live" };
  } catch {
    return { explanation: fallbackExplanation(result), source: "fallback" };
  }
}
