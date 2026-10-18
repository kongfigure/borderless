import { generate } from "./llm.js";

export interface OriginStoryInput {
  productName: string;
  brand: string;
  originCountry: string;
  category: string;
  /** Stored fallback story, used verbatim if the live call is unavailable. */
  fallbackStory: string;
}

export interface OriginStoryResult {
  story: string;
  source: "live" | "fallback";
}

/** Calls Claude with ONLY the structured facts below to write a short origin
 * story. Falls back to the stored, pre-written story (never fabricated) if
 * the key is missing, the cost cap is reached, or the call fails. */
export async function originStory(input: OriginStoryInput): Promise<OriginStoryResult> {
  const response = await generate({
    maxTokens: 150,
    prompt: `Write a short, warm 2-3 sentence "where it's from" story for a shopper, using ONLY the facts given below. Only state things you're confident are accurate — if you're unsure of a specific detail (exact dates, named makers), keep that part general instead of guessing. Reply with plain text only, no markdown.\n\nProduct: ${input.productName}\nMaker/brand: ${input.brand}\nOrigin: ${input.originCountry}\nCategory: ${input.category}`,
  });

  if (!response) {
    return { story: input.fallbackStory, source: "fallback" };
  }
  return { story: response.text, source: "live" };
}
