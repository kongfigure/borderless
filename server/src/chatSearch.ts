import { landedCost, trustVerdict } from "../../shared/calculations.js";
import type { Product, ScoredProduct } from "../../shared/types.js";
import type { SearchIntent } from "./chatIntent.js";

const MAX_RESULTS = 6;

/** Pure in-code product search for deterministic chat intents — scores every
 * product the same way the rest of the app does, then filters/sorts by the
 * parsed intent. Never calls the model. */
export function searchProducts(products: Product[], intent: SearchIntent): ScoredProduct[] {
  const scored: ScoredProduct[] = products
    .filter((p) => !intent.giftableOnly || p.giftable)
    .map((p) => ({ ...p, landedCost: landedCost(p), verdictResult: trustVerdict(p) }))
    .filter((p) => intent.minUSD === null || p.landedCost.totalUSD >= intent.minUSD)
    .filter((p) => intent.maxUSD === null || p.landedCost.totalUSD <= intent.maxUSD);

  scored.sort((a, b) =>
    intent.sort === "fastest" ? a.deliveryDays - b.deliveryDays : a.landedCost.totalUSD - b.landedCost.totalUSD
  );

  return scored.slice(0, MAX_RESULTS);
}
