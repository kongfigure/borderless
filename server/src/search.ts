import { loadProducts } from "./data.js";
import { scoreProduct } from "./score.js";
import type { ScoredProduct } from "../../shared/types.js";

/** Simple keyword match against title and category/marketplace, ranked by
 * match count. Listings that match nothing are left out rather than
 * padded with irrelevant results. */
export function searchProducts(query: string): ScoredProduct[] {
  const { products } = loadProducts();
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const ranked = products
    .map((product) => {
      const haystack = `${product.title} ${product.category} ${product.marketplace}`.toLowerCase();
      const matchCount = keywords.filter((keyword) => haystack.includes(keyword)).length;
      return { product, matchCount };
    })
    .filter((entry) => entry.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);

  return ranked.map((entry) => scoreProduct(entry.product));
}
