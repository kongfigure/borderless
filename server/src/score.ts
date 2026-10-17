import { landedCost, trustVerdict } from "../../shared/calculations.js";
import type { Product, ScoredProduct } from "../../shared/types.js";

export function scoreProduct(product: Product): ScoredProduct {
  return {
    ...product,
    landedCost: landedCost(product),
    verdictResult: trustVerdict(product),
  };
}
