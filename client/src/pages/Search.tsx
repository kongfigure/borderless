import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import type { Category, Marketplace, ScoredProduct } from "@shared/types";
import { searchProducts, type SearchResponse } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { getBadge } from "@/lib/verdict";

const LOADING_STEPS = [
  "Understanding your request",
  "Translating search terms",
  "Finding relevant products",
  "Calculating delivered costs",
  "Reviewing seller signals",
  "Preparing recommendations",
];

type BadgeFilter = "all" | "Looks good" | "Pre-order" | "Skip" | "Not enough info";
type SortOption = "recommended" | "price" | "delivery";

const CATEGORY_OPTIONS: Array<Category | "all"> = ["all", "Furniture", "Home Goods", "Clothing"];
const MARKETPLACE_OPTIONS: Array<Marketplace | "all"> = [
  "all",
  "Taobao",
  "Rakuten",
  "Coupang",
  "Naver Shopping",
  "Flipkart",
  "Mercado Libre",
  "Vinted",
];
const MAX_PRICE_OPTIONS = [
  { label: "Any price", value: Infinity },
  { label: "Under $50", value: 50 },
  { label: "Under $100", value: 100 },
  { label: "Under $200", value: 200 },
];
const MAX_DELIVERY_OPTIONS = [
  { label: "Any delivery time", value: Infinity },
  { label: "Under 10 days", value: 10 },
  { label: "Under 15 days", value: 15 },
  { label: "Under 21 days", value: 21 },
];
const BADGE_FILTER_OPTIONS: BadgeFilter[] = ["all", "Looks good", "Pre-order", "Skip", "Not enough info"];

export function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  const [queryInput, setQueryInput] = useState(q);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const [category, setCategory] = useState<Category | "all">("all");
  const [marketplace, setMarketplace] = useState<Marketplace | "all">("all");
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [maxDelivery, setMaxDelivery] = useState(Infinity);
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>("all");
  const [sort, setSort] = useState<SortOption>("recommended");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setQueryInput(q);
  }, [q]);

  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setStepIndex(0);

    searchProducts(trimmed)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Something went wrong while searching.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q]);

  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!isLoading) {
      if (stepTimer.current) clearInterval(stepTimer.current);
      return;
    }
    stepTimer.current = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1));
    }, 450);
    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
  }, [isLoading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = queryInput.trim();
    if (!trimmed) return;
    setParams({ q: trimmed });
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredResults = useMemo(() => {
    const results = data?.results ?? [];
    const filtered = results.filter((product) => {
      if (category !== "all" && product.category !== category) return false;
      if (marketplace !== "all" && product.marketplace !== marketplace) return false;
      if (product.landedCost.totalUSD >= maxPrice) return false;
      if (product.deliveryDays >= maxDelivery) return false;
      if (badgeFilter !== "all" && getBadge(product).label !== badgeFilter) return false;
      return true;
    });

    const sorted = [...filtered];
    if (sort === "price") {
      sorted.sort((a, b) => a.landedCost.totalUSD - b.landedCost.totalUSD);
    } else if (sort === "delivery") {
      sorted.sort((a, b) => a.deliveryDays - b.deliveryDays);
    }
    return sorted;
  }, [data, category, marketplace, maxPrice, maxDelivery, badgeFilter, sort]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <form onSubmit={handleSearch} className="flex max-w-xl items-center gap-2 rounded-full border border-line bg-card p-2 dark:border-dark-line dark:bg-dark-card">
        <SearchIcon size={20} className="ml-3 shrink-0 text-ink/50 dark:text-ivory/50" aria-hidden="true" />
        <input
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          aria-label="What do you want to buy?"
          className="min-w-0 flex-1 bg-transparent px-1 text-base text-ink outline-none dark:text-ivory"
        />
        <button
          type="submit"
          className="flex min-h-[44px] shrink-0 items-center rounded-full bg-forest px-6 text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] dark:bg-gold dark:text-ink"
        >
          Search
        </button>
      </form>

      {!q.trim() && (
        <p className="mt-10 text-ink/60 dark:text-ivory/60">Search for something above to see results.</p>
      )}

      {q.trim() && isLoading && (
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="font-display text-xl text-ink dark:text-ivory"
              aria-live="polite"
            >
              {LOADING_STEPS[stepIndex]}...
            </motion.p>
          </AnimatePresence>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-3xl border border-line bg-card dark:border-dark-line dark:bg-dark-card"
              />
            ))}
          </div>
        </div>
      )}

      {q.trim() && !isLoading && error && (
        <p className="mt-10 rounded-2xl border border-bad/30 bg-bad-soft px-5 py-4 text-sm text-bad">{error}</p>
      )}

      {q.trim() && !isLoading && !error && data && (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl text-ink dark:text-ivory">Results for &ldquo;{q}&rdquo;</h1>
            <span className="rounded-full bg-card px-4 py-1.5 text-sm text-ink dark:bg-dark-card dark:text-ivory">
              {data.source === "fallback" ? "Sample translation: " : "Searched for: "}
              <strong>{data.chineseTerm}</strong>
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label="Filter and sort results">
            <label className="sr-only" htmlFor="filter-category">
              Category
            </label>
            <select
              id="filter-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | "all")}
              className="min-h-[44px] rounded-full border border-line bg-card px-4 text-sm text-ink dark:border-dark-line dark:bg-dark-card dark:text-ivory"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "all" ? "All categories" : opt}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="filter-marketplace">
              Marketplace
            </label>
            <select
              id="filter-marketplace"
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value as Marketplace | "all")}
              className="min-h-[44px] rounded-full border border-line bg-card px-4 text-sm text-ink dark:border-dark-line dark:bg-dark-card dark:text-ivory"
            >
              {MARKETPLACE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "all" ? "All marketplaces" : opt}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="filter-price">
              Maximum total price
            </label>
            <select
              id="filter-price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="min-h-[44px] rounded-full border border-line bg-card px-4 text-sm text-ink dark:border-dark-line dark:bg-dark-card dark:text-ivory"
            >
              {MAX_PRICE_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="filter-delivery">
              Maximum delivery time
            </label>
            <select
              id="filter-delivery"
              value={maxDelivery}
              onChange={(e) => setMaxDelivery(Number(e.target.value))}
              className="min-h-[44px] rounded-full border border-line bg-card px-4 text-sm text-ink dark:border-dark-line dark:bg-dark-card dark:text-ivory"
            >
              {MAX_DELIVERY_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="filter-verdict">
              Verdict
            </label>
            <select
              id="filter-verdict"
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value as BadgeFilter)}
              className="min-h-[44px] rounded-full border border-line bg-card px-4 text-sm text-ink dark:border-dark-line dark:bg-dark-card dark:text-ivory"
            >
              {BADGE_FILTER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "all" ? "Any verdict" : opt}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="sort-results">
              Sort
            </label>
            <select
              id="sort-results"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="min-h-[44px] rounded-full border border-line bg-card px-4 text-sm text-ink dark:border-dark-line dark:bg-dark-card dark:text-ivory"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price">Sort: Lowest delivered price</option>
              <option value="delivery">Sort: Fastest delivery</option>
            </select>
          </div>

          <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4 text-sm text-ink dark:text-ivory">
            <strong>Learn as you shop:</strong> Compare the total delivered cost, not just the listing price.
          </div>

          {filteredResults.length === 0 ? (
            <p className="mt-10 text-ink/60 dark:text-ivory/60">No listings match these filters yet.</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResults.map((product: ScoredProduct, i: number) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  tileIndex={i}
                  saved={savedIds.has(product.id)}
                  onSave={toggleSave}
                />
              ))}
            </div>
          )}

          <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
            Sample data for the demo — prices, reviews and verdicts shown here are not real listings. Verdicts are a
            guide from public signals, not proof.
          </p>
        </>
      )}
    </div>
  );
}
