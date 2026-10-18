import Anthropic from "@anthropic-ai/sdk";

export interface DeinfluenceInput {
  itemName: string;
  priceUSD: number;
}

export interface DeinfluenceResult {
  costPerUseUSD: number;
  assumedUses: number;
  usageNote: string;
  verdict: string;
  tip: string;
  alternative: string;
  source: "live" | "fallback";
}

/** How many times a shopper is assumed to use the item, for a deterministic
 * cost-per-use. A documented demo assumption, matched by keyword, not a
 * real usage study. */
const USAGE_ASSUMPTIONS: Array<{ match: string; uses: number; note: string }> = [
  { match: "tumbler", uses: 400, note: "used twice a day for about a year" },
  { match: "chair", uses: 365, note: "used once a day for a year" },
  { match: "blender", uses: 150, note: "used three times a week for a year" },
  { match: "serum", uses: 90, note: "used daily until the bottle runs out in about 3 months" },
];
const DEFAULT_USAGE = { uses: 36, note: "used a few times a week for about three months" };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function getUsage(itemName: string): { uses: number; note: string } {
  const normalized = itemName.trim().toLowerCase();
  const hit = USAGE_ASSUMPTIONS.find((a) => normalized.includes(a.match));
  return hit ?? DEFAULT_USAGE;
}

function fallbackContent(itemName: string, costPerUseUSD: number): Pick<DeinfluenceResult, "verdict" | "tip" | "alternative"> {
  return {
    verdict: `${itemName} works out to about $${costPerUseUSD.toFixed(2)} per use at that rate — not outrageous, but the hype is doing a lot of the convincing here.`,
    tip: "Give it 48 hours before buying. If you still want it after sleeping on it, it's probably not just the algorithm talking.",
    alternative: "A cheaper, less-viral version of the same idea almost always already exists — worth a quick look before buying the trending one.",
  };
}

/** Computes cost-per-use deterministically, then calls the Anthropic API
 * with ONLY that structured data (item name, price, cost per use, usage
 * assumption) for a funny-but-kind verdict, one practical tip, and one
 * smarter alternative. Falls back to a template if the key is missing, the
 * call fails, or the response isn't valid JSON — never fakes a live
 * response. */
export async function deinfluence(input: DeinfluenceInput): Promise<DeinfluenceResult> {
  const { itemName, priceUSD } = input;
  const { uses, note } = getUsage(itemName);
  const costPerUseUSD = round2(priceUSD / uses);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { costPerUseUSD, assumedUses: uses, usageNote: note, ...fallbackContent(itemName, costPerUseUSD), source: "fallback" };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `A shopper is considering a trending item. Given ONLY this structured data, respond with a funny but kind verdict (never shaming), one practical tip, and one smarter alternative. Reply with ONLY valid JSON, no markdown, in this exact shape: {"verdict": "...", "tip": "...", "alternative": "..."}\n\nItem: ${itemName}\nPrice: $${priceUSD}\nCost per use: $${costPerUseUSD.toFixed(2)} (assuming ${note})`,
        },
      ],
    });
    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    const parsed = JSON.parse(text);
    if (
      typeof parsed.verdict !== "string" ||
      typeof parsed.tip !== "string" ||
      typeof parsed.alternative !== "string"
    ) {
      throw new Error("malformed response");
    }

    return {
      costPerUseUSD,
      assumedUses: uses,
      usageNote: note,
      verdict: parsed.verdict,
      tip: parsed.tip,
      alternative: parsed.alternative,
      source: "live",
    };
  } catch {
    return { costPerUseUSD, assumedUses: uses, usageNote: note, ...fallbackContent(itemName, costPerUseUSD), source: "fallback" };
  }
}
