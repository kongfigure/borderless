import { generate } from "./llm.js";

export interface OrderHistoryItem {
  id: string;
  itemName: string;
  priceUSD: number;
  category: string;
  date: string;
  timesUsed: number;
  lastUsedDaysAgo: number;
}

export interface OrderStats {
  totalSpentUSD: number;
  duplicateCategoryCount: number;
  biggestRegretId: string | null;
  moneyCouldHaveSavedUSD: number;
  regretScore: number;
}

export interface RoastResult {
  perOrder: Record<string, string>;
  overall: string;
  stats: OrderStats;
  source: "live" | "fallback";
}

export type Spiciness = "mild" | "spicy";

/** Uses-per-dollar below this is treated as "could have saved this money" —
 * a documented demo threshold, not a real value-for-money study. */
const REGRET_RATIO_THRESHOLD = 0.2;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function valueRatio(order: OrderHistoryItem): number {
  if (order.priceUSD <= 0) return Infinity;
  return order.timesUsed / order.priceUSD;
}

export function computeStats(orders: OrderHistoryItem[]): OrderStats {
  if (orders.length === 0) {
    return { totalSpentUSD: 0, duplicateCategoryCount: 0, biggestRegretId: null, moneyCouldHaveSavedUSD: 0, regretScore: 0 };
  }

  const totalSpentUSD = round2(orders.reduce((sum, o) => sum + o.priceUSD, 0));

  const categoryCounts = new Map<string, number>();
  for (const o of orders) {
    categoryCounts.set(o.category, (categoryCounts.get(o.category) ?? 0) + 1);
  }
  let duplicateCategoryCount = 0;
  for (const count of categoryCounts.values()) {
    if (count > 1) duplicateCategoryCount += count;
  }

  const biggestRegret = orders.reduce((worst, o) => (valueRatio(o) < valueRatio(worst) ? o : worst), orders[0]);

  const moneyCouldHaveSavedUSD = round2(
    orders.filter((o) => valueRatio(o) < REGRET_RATIO_THRESHOLD).reduce((sum, o) => sum + o.priceUSD, 0)
  );

  const regretScore = totalSpentUSD > 0
    ? Math.max(0, Math.min(100, Math.round((moneyCouldHaveSavedUSD / totalSpentUSD) * 100)))
    : 0;

  return { totalSpentUSD, duplicateCategoryCount, biggestRegretId: biggestRegret.id, moneyCouldHaveSavedUSD, regretScore };
}

function fallbackPerOrderLine(order: OrderHistoryItem, stats: OrderStats): string {
  const ratio = valueRatio(order);
  const isRegret = ratio < REGRET_RATIO_THRESHOLD;
  const isBiggest = order.id === stats.biggestRegretId;
  const base = isBiggest
    ? `The ${order.itemName.toLowerCase()} got used ${order.timesUsed} time${order.timesUsed === 1 ? "" : "s"} for $${order.priceUSD.toFixed(2)} — that's the real champion of this order history, and not in a good way.`
    : isRegret
      ? `The ${order.itemName.toLowerCase()} has been quiet lately — ${order.timesUsed} use${order.timesUsed === 1 ? "" : "s"} out of $${order.priceUSD.toFixed(2)} spent.`
      : `The ${order.itemName.toLowerCase()} has earned its spot with ${order.timesUsed} uses.`;
  const smarterMove = isRegret
    ? "Smarter move: wait a week before the next impulse buy in this category and see if you still want it."
    : "Smarter move: keep doing exactly this — it's pulling its weight.";
  return `${base} ${smarterMove}`;
}

function fallbackOverall(stats: OrderStats, orders: OrderHistoryItem[], spiciness: Spiciness): string {
  const biggestRegretOrder = orders.find((o) => o.id === stats.biggestRegretId);
  const tone = spiciness === "spicy" ? "Okay, let's be honest:" : "Gently speaking:";
  const regretPart = biggestRegretOrder
    ? ` the ${biggestRegretOrder.itemName.toLowerCase()} is doing the least work for its price.`
    : "";
  return (
    `${tone} you've spent $${stats.totalSpentUSD.toFixed(2)} across these orders, and about $${stats.moneyCouldHaveSavedUSD.toFixed(2)} ` +
    `of that didn't really get used enough to earn its keep —${regretPart} ${stats.duplicateCategoryCount > 0 ? "You've also doubled up on the same category more than once." : ""} ` +
    `You may still buy it. Now you know why.`
  ).replace(/\s+/g, " ").trim();
}

function fallbackResult(orders: OrderHistoryItem[], spiciness: Spiciness): RoastResult {
  const stats = computeStats(orders);
  const perOrder: Record<string, string> = {};
  for (const o of orders) {
    perOrder[o.id] = `Offline roast: ${fallbackPerOrderLine(o, stats)}`;
  }
  return { perOrder, overall: `Offline roast: ${fallbackOverall(stats, orders, spiciness)}`, stats, source: "fallback" };
}

const ROAST_RULES =
  "Roast the PURCHASES and HABITS only — never the person's body, appearance, identity, or financial character " +
  "(no calling them poor, broke, irresponsible, etc). Keep it funny but affectionate, like a close friend teasing " +
  "them, never cruel or shaming.";

/** Calls Claude with ONLY structured order data and server-computed stats
 * (never raw free text), asking for one roast line per order plus an overall
 * verdict. Falls back to deterministic, stats-driven templates if the key
 * is missing, the cost cap is reached, or the call fails — never fabricates
 * a live response. */
export async function roastOrders(orders: OrderHistoryItem[], spiciness: Spiciness): Promise<RoastResult> {
  const stats = computeStats(orders);

  if (orders.length === 0) {
    return fallbackResult(orders, spiciness);
  }

  const toneInstruction =
    spiciness === "spicy"
      ? "Tone: playfully sharp and cheeky, but still kind."
      : "Tone: gentle and warm.";

  const orderLines = orders
    .map(
      (o) =>
        `- id: ${o.id}, item: ${o.itemName}, price: $${o.priceUSD}, category: ${o.category}, timesUsed: ${o.timesUsed}, lastUsedDaysAgo: ${o.lastUsedDaysAgo}`
    )
    .join("\n");

  const response = await generate({
    maxTokens: 700,
    prompt:
      `A shopper wants their past orders roasted, affectionately. ${ROAST_RULES} ${toneInstruction}\n\n` +
      `Orders:\n${orderLines}\n\n` +
      `Computed stats: totalSpentUSD=$${stats.totalSpentUSD}, duplicateCategoryCount=${stats.duplicateCategoryCount}, ` +
      `biggestRegretId=${stats.biggestRegretId}, moneyCouldHaveSavedUSD=$${stats.moneyCouldHaveSavedUSD}, regretScore=${stats.regretScore}\n\n` +
      `Write ONE roast line per order (ending each with "Smarter move: ..."), plus one overall verdict that ends with the exact phrase ` +
      `"You may still buy it. Now you know why." Reply with ONLY valid JSON, no markdown, in this exact shape: ` +
      `{"perOrder": {"<id>": "..."}, "overall": "..."}`,
  });

  if (!response) return fallbackResult(orders, spiciness);

  try {
    const parsed = JSON.parse(response.text);
    if (
      typeof parsed.perOrder !== "object" ||
      parsed.perOrder === null ||
      typeof parsed.overall !== "string" ||
      !orders.every((o) => typeof parsed.perOrder[o.id] === "string")
    ) {
      throw new Error("malformed response");
    }

    return { perOrder: parsed.perOrder, overall: parsed.overall, stats, source: "live" };
  } catch {
    return fallbackResult(orders, spiciness);
  }
}
