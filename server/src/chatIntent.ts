export interface SearchIntent {
  kind: "search";
  minUSD: number | null;
  maxUSD: number | null;
  giftableOnly: boolean;
  sort: "price_asc" | "fastest";
}

export interface BagContentsIntent {
  kind: "bagContents";
}

export interface BagCompareIntent {
  kind: "bagCompare";
}

export interface FreeTextIntent {
  kind: "freeText";
}

export type ChatIntent = SearchIntent | BagContentsIntent | BagCompareIntent | FreeTextIntent;

function parseMoney(raw: string): number {
  return Number(raw.replace(/[$,]/g, ""));
}

/** Parses a handful of shopping intents entirely in code, with no model
 * call — budget/gift/fastest search and bag questions must work even when
 * no LLM is configured. Anything else falls through to "freeText" for the
 * caller to optionally hand to the model. */
export function parseIntent(message: string): ChatIntent {
  const lower = message.toLowerCase();

  if (/\bmy (bag|cart)\b/.test(lower)) {
    return /\bcompare\b/.test(lower) ? { kind: "bagCompare" } : { kind: "bagContents" };
  }

  const giftableOnly = /\bgift/.test(lower);
  const isFastest = /\bfastest|quickest|soonest|fast shipping\b/.test(lower);
  const isCheapest = /\bcheap|lowest|best price|budget\b/.test(lower);

  const betweenMatch = lower.match(/between\s*\$?(\d+(?:\.\d+)?)\s*(?:and|-|to)\s*\$?(\d+(?:\.\d+)?)/);
  const underMatch = lower.match(/(?:under|below|less than|cheaper than|up to)\s*\$?(\d+(?:\.\d+)?)/);
  const overMatch = lower.match(/(?:over|above|more than|at least)\s*\$?(\d+(?:\.\d+)?)/);

  let minUSD: number | null = null;
  let maxUSD: number | null = null;

  if (betweenMatch) {
    const a = parseMoney(betweenMatch[1]);
    const b = parseMoney(betweenMatch[2]);
    minUSD = Math.min(a, b);
    maxUSD = Math.max(a, b);
  } else {
    if (underMatch) maxUSD = parseMoney(underMatch[1]);
    if (overMatch) minUSD = parseMoney(overMatch[1]);
  }

  const hasExplicitSearchSignal = giftableOnly || isFastest || isCheapest || minUSD !== null || maxUSD !== null;
  if (!hasExplicitSearchSignal) {
    return { kind: "freeText" };
  }

  return {
    kind: "search",
    minUSD,
    maxUSD,
    giftableOnly,
    sort: isFastest ? "fastest" : "price_asc",
  };
}
