import Anthropic from "@anthropic-ai/sdk";

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

/** Calls the Anthropic API with ONLY the structured numbers below — never
 * the shopper's raw input text — to write a short price-vs-usual-range
 * explanation. Falls back to a template sentence if the key is missing or
 * the call fails. */
export async function hypeCheck(input: HypeCheckInput): Promise<HypeCheckResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { explanation: fallbackExplanation(input), source: "fallback" };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 80,
      messages: [
        {
          role: "user",
          content: `You are helping a shopper decide if a trending item is worth the hype. Given ONLY this structured data, write 2-3 short, direct sentences comparing the price to the usual range and the cost per use, mentioning the cheaper alternative if the price is above the usual range. Be plain and honest, not preachy.\n\n${JSON.stringify(input)}`,
        },
      ],
    });
    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!text) {
      return { explanation: fallbackExplanation(input), source: "fallback" };
    }
    return { explanation: text, source: "live" };
  } catch {
    return { explanation: fallbackExplanation(input), source: "fallback" };
  }
}
