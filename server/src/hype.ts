import { generate } from "./llm.js";

export interface HypeCheckInput {
  itemName: string;
  priceUSD: number;
  typicalLowUSD: number;
  typicalHighUSD: number;
  costPerUseUSD: number;
  cheaperAlternative: { name: string; priceUSD: number };
}

export interface HypeCheckResult {
  explanation: string;
  source: "live" | "fallback";
}

function fallbackExplanation(input: HypeCheckInput): string {
  const { itemName, priceUSD, typicalLowUSD, typicalHighUSD, costPerUseUSD, cheaperAlternative } = input;
  if (priceUSD > typicalHighUSD) {
    const overBy = Math.round(((priceUSD - typicalHighUSD) / typicalHighUSD) * 100);
    return `${itemName} is priced about ${overBy}% above the usual $${typicalLowUSD}–$${typicalHighUSD} range for similar items, working out to roughly $${costPerUseUSD.toFixed(2)} per use. ${cheaperAlternative.name} is a similar (not identical) option around $${cheaperAlternative.priceUSD}, within the usual range.`;
  }
  return `${itemName} is priced within the usual $${typicalLowUSD}–$${typicalHighUSD} range for similar items, working out to roughly $${costPerUseUSD.toFixed(2)} per use.`;
}

/** Calls Claude with ONLY the structured numbers below — never the
 * shopper's raw input text — to write a short price-vs-usual-range
 * explanation. Falls back to a template sentence if the key is missing,
 * the cost cap is reached, or the call fails. */
export async function hypeCheck(input: HypeCheckInput): Promise<HypeCheckResult> {
  const response = await generate({
    maxTokens: 80,
    prompt: `You are helping a shopper decide if a trending item is worth the hype. Given ONLY this structured data, write 2-3 short, direct sentences comparing the price to the usual range and the cost per use, mentioning the cheaper alternative if the price is above the usual range. Be plain and honest, not preachy.\n\n${JSON.stringify(input)}`,
  });

  if (!response) {
    return { explanation: fallbackExplanation(input), source: "fallback" };
  }
  return { explanation: response.text, source: "live" };
}
