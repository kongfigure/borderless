import type { ScoredProduct } from "@shared/types";
import type { TastePreferences } from "./preferences";

export interface Recommendation {
  product: ScoredProduct;
  reason: string;
}

/** Ranks sample products against the shopper's saved taste preferences.
 * Only fields backed by structured product data affect the score —
 * clothing size and style are collected for display only and are never
 * used here, since nothing in the sample data could honestly confirm a
 * size or style match. */
export function recommend(
  products: ScoredProduct[],
  prefs: TastePreferences,
  limit = 6
): Recommendation[] {
  const scored = products.map((product) => {
    let score = 0;
    const reasons: string[] = [];

    if (prefs.categories.length > 0 && prefs.categories.includes(product.category)) {
      score += 2;
      reasons.push(`it's in ${product.category.toLowerCase()}, a category you picked`);
    }

    if (prefs.budgetUSD !== null && product.landedCost.totalUSD <= prefs.budgetUSD) {
      score += 1;
      reasons.push(`it fits your $${prefs.budgetUSD} budget`);
    }

    if (
      prefs.deliveryDeadlineDays !== null &&
      product.deliveryDays <= prefs.deliveryDeadlineDays
    ) {
      score += 1;
      reasons.push(`it arrives within ${prefs.deliveryDeadlineDays} days`);
    }

    if (product.verdictResult.verdict === "looks_good") {
      score += 0.5;
      reasons.push("it looks good on our trust signals");
    }

    const reason = reasons.length > 0 ? `Recommended because ${reasons[0]}.` : "Popular across our destinations.";

    return { product, score, reason };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product, reason }) => ({ product, reason }));
}
