import { useEffect, useMemo, useState } from "react";
import { Armchair, Home as HomeIcon, Shirt, Sparkle } from "lucide-react";
import type { Category, Condition, Product } from "@shared/types";
import { landedCost, trustVerdict } from "@shared/calculations";
import { fetchProducts } from "@/lib/api";
import { Flag } from "@/components/Flag";
import { LearnTip } from "@/components/LearnTip";
import { MARKETPLACE_INFO } from "@/lib/marketplaces";

const CATEGORY_ICON = { Furniture: Armchair, "Home Goods": HomeIcon, Clothing: Shirt } as const;
const CATEGORIES: Category[] = ["Furniture", "Home Goods", "Clothing"];
const CONDITIONS: Condition[] = ["Excellent", "Good", "Worn"];

const CONDITION_STYLES: Record<Condition, string> = {
  Excellent: "bg-good-soft text-good",
  Good: "bg-gold/15 text-ink dark:text-ivory",
  Worn: "bg-line text-ink/70 dark:bg-dark-line dark:text-ivory/70",
};

export function Resale() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | "All">("All");
  const [condition, setCondition] = useState<Condition | "All">("All");

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Couldn't reach the sample data API. Is the server running?"));
  }, []);

  const scored = useMemo(() => {
    if (!products) return null;
    return products
      .filter((p) => p.condition)
      .filter((p) => category === "All" || p.category === category)
      .filter((p) => condition === "All" || p.condition === condition)
      .map((product) => ({
        ...product,
        landedCost: landedCost(product),
        verdictResult: trustVerdict(product),
      }));
  }, [products, category, condition]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        Good design deserves another life
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink dark:text-ivory">Resale</h1>
      <p className="mt-3 max-w-xl text-ink/70 dark:text-ivory/70">
        Secondhand and vintage pieces from Vinted and Rakuten — clothing, furniture and home accessories with a
        little history already in them.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("All")}
          className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
            category === "All"
              ? "bg-forest text-ivory dark:bg-gold dark:text-dark-bg"
              : "border border-line text-ink/70 hover:border-forest hover:text-forest dark:border-dark-line dark:text-ivory/70 dark:hover:border-gold dark:hover:text-gold"
          }`}
        >
          All categories
        </button>
        {CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICON[c];
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
                category === c
                  ? "bg-forest text-ivory dark:bg-gold dark:text-dark-bg"
                  : "border border-line text-ink/70 hover:border-forest hover:text-forest dark:border-dark-line dark:text-ivory/70 dark:hover:border-gold dark:hover:text-gold"
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCondition("All")}
          className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
            condition === "All"
              ? "bg-ink text-ivory dark:bg-ivory dark:text-dark-bg"
              : "border border-line text-ink/70 hover:border-ink dark:border-dark-line dark:text-ivory/70 dark:hover:border-ivory"
          }`}
        >
          Any condition
        </button>
        {CONDITIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCondition(c)}
            aria-pressed={condition === c}
            className={`flex min-h-[44px] items-center rounded-full px-4 text-sm font-medium transition-colors ${
              condition === c
                ? "bg-ink text-ivory dark:bg-ivory dark:text-dark-bg"
                : "border border-line text-ink/70 hover:border-ink dark:border-dark-line dark:text-ivory/70 dark:hover:border-ivory"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-8 rounded-2xl border border-bad/30 bg-bad-soft px-5 py-4 text-sm text-bad">{error}</p>
      )}

      {!scored && !error && (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-3xl border border-line bg-card dark:border-dark-line dark:bg-dark-card"
            />
          ))}
        </div>
      )}

      {scored && scored.length === 0 && (
        <p className="mt-10 text-sm text-ink/60 dark:text-ivory/60">No pre-loved pieces match these filters yet.</p>
      )}

      {scored && scored.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {scored.map((product) => {
            const Icon = CATEGORY_ICON[product.category];
            const mkt = MARKETPLACE_INFO[product.marketplace];
            return (
              <div
                key={product.id}
                className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-4 transition-transform hover:-translate-y-1 dark:border-dark-line dark:bg-dark-card"
              >
                <div className="relative flex h-36 items-center justify-center rounded-2xl bg-gold/10">
                  <Icon size={40} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-ivory/90 px-3 py-1 text-xs font-semibold text-ink dark:bg-dark-bg/90 dark:text-ivory">
                    <Sparkle size={12} aria-hidden="true" />
                    Pre-loved
                  </span>
                  {product.condition && (
                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${CONDITION_STYLES[product.condition]}`}
                    >
                      {product.condition}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Flag code={product.countryCode} />
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-ivory"
                    style={{ backgroundColor: mkt.color }}
                    aria-hidden="true"
                  >
                    {mkt.code}
                  </span>
                  <span className="text-xs text-ink/50 dark:text-ivory/50">{product.marketplace}</span>
                </div>

                <p className="font-display text-lg text-ink dark:text-ivory">{product.title}</p>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-ink/50 dark:text-ivory/50">${product.itemPriceUSD.toFixed(2)} item</span>
                  <span className="font-display text-xl text-forest dark:text-gold">
                    ${product.landedCost.totalUSD.toFixed(2)}
                  </span>
                </div>
                <p className="text-right text-xs text-ink/50 dark:text-ivory/50">
                  {product.deliveryDays} days to your door
                </p>
              </div>
            );
          })}
        </div>
      )}

      <LearnTip>
        Secondhand pieces skip the manufacturing step entirely, so "delivered cost" here is mostly shipping, duty
        and tax on an already-made item — worth comparing against buying new.
      </LearnTip>

      <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
        Sample data for the demo — condition, prices and delivery estimates shown here are not real listings.
      </p>
    </div>
  );
}
