import Anthropic from "@anthropic-ai/sdk";

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

/** Calls Anthropic with ONLY the structured facts below to write a short
 * origin story. Falls back to the stored, pre-written story (never
 * fabricated) if the key is missing or the call fails. */
export async function originStory(input: OriginStoryInput): Promise<OriginStoryResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { story: input.fallbackStory, source: "fallback" };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Write a short, warm 2-3 sentence "where it's from" story for a shopper, using ONLY the facts given below. Only state things you're confident are accurate — if you're unsure of a specific detail (exact dates, named makers), keep that part general instead of guessing. Reply with plain text only, no markdown.\n\nProduct: ${input.productName}\nMaker/brand: ${input.brand}\nOrigin: ${input.originCountry}\nCategory: ${input.category}`,
        },
      ],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!text) {
      return { story: input.fallbackStory, source: "fallback" };
    }
    return { story: text, source: "live" };
  } catch {
    return { story: input.fallbackStory, source: "fallback" };
  }
}
