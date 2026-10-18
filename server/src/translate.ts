import { generate } from "./llm.js";

export interface TranslationResult {
  chineseTerm: string;
  source: "live" | "fallback";
}

const FALLBACK_DICTIONARY: Array<{ match: string; chineseTerm: string }> = [
  { match: "oversized linen shirt", chineseTerm: "亚麻衬衫 宽松" },
  { match: "linen shirt", chineseTerm: "亚麻衬衫" },
  { match: "linen", chineseTerm: "亚麻" },
  { match: "oak table", chineseTerm: "橡木边桌" },
  { match: "side table", chineseTerm: "边桌" },
  { match: "dinnerware", chineseTerm: "陶瓷餐具" },
  { match: "ceramic", chineseTerm: "陶瓷" },
  { match: "rattan chair", chineseTerm: "藤编单人椅" },
  { match: "accent chair", chineseTerm: "单人椅" },
  { match: "denim jacket", chineseTerm: "牛仔夹克" },
  { match: "wool blanket", chineseTerm: "羊毛毯" },
  { match: "cotton dress", chineseTerm: "棉质连衣裙" },
  { match: "vase", chineseTerm: "花瓶" },
];

function fallbackTranslate(query: string): string {
  const normalized = query.trim().toLowerCase();
  const hit = FALLBACK_DICTIONARY.find((entry) => normalized.includes(entry.match));
  return hit ? hit.chineseTerm : query.trim();
}

/** Generates the Chinese search term a shopper would use, via Claude. Falls
 * back to a small local dictionary if the key is missing, the cost cap is
 * reached, or the call fails — never fakes a live response. */
export async function translateQuery(query: string): Promise<TranslationResult> {
  const response = await generate({
    maxTokens: 30,
    prompt: `Translate this shopping search query into the Chinese search term a shopper would type on Taobao to find it. Reply with ONLY the Chinese term, no quotes, no explanation.\n\nQuery: ${query}`,
  });

  if (!response) {
    return { chineseTerm: fallbackTranslate(query), source: "fallback" };
  }
  return { chineseTerm: response.text, source: "live" };
}
