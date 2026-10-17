import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Armchair, Home as HomeIcon, Shirt } from "lucide-react";
import type { Category, Product } from "@shared/types";
import { landedCost, trustVerdict } from "@shared/calculations";
import { fetchProducts } from "@/lib/api";
import { DESTINATIONS } from "@/lib/destinations";
import { MARKETPLACE_INFO } from "@/lib/marketplaces";
import { Flag } from "@/components/Flag";
import { ProductCard } from "@/components/ProductCard";
import { LearnTip } from "@/components/LearnTip";

const CATEGORY_ICON = { Furniture: Armchair, "Home Goods": HomeIcon, Clothing: Shirt } as const;
const CATEGORIES: Category[] = ["Furniture", "Home Goods", "Clothing"];

export function DestinationCity() {
  const { city } = useParams<{ city: string }>();
  const hub = DESTINATIONS.find((d) => d.slug === city);

  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | "All">("All");

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Couldn't reach the sample data API. Is the server running?"));
  }, []);

  const scored = useMemo(() => {
    if (!products || !hub) return null;
    return products
      .filter((p) => p.country === hub.country)
      .filter((p) => category === "All" || p.category === category)
      .map((product) => ({
        ...product,
        landedCost: landedCost(product),
        verdictResult: trustVerdict(product),
      }));
  }, [products, hub, category]);

  if (!hub) {
    return <Navigate to="/destinations" replace />;
  }

  const otherHubs = DESTINATIONS.filter((d) => d.slug !== hub.slug);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex items-center gap-2">
        <Flag code={hub.countryCode} />
        <span className="text-xs text-ink/50 dark:text-ivory/50">{hub.country}</span>
      </div>
      <h1 className="mt-3 font-display text-4xl text-ink dark:text-ivory sm:text-5xl">{hub.city}</h1>
      <p className="mt-3 max-w-xl text-ink/70 dark:text-ivory/70">{hub.description}</p>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
          <h2 className="font-display text-lg text-ink dark:text-ivory">Marketplaces</h2>
          <div className="mt-4 flex flex-col gap-3">
            {hub.marketplaces.map((m) => (
              <div key={m} className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full font-display text-sm text-ivory"
                  style={{ backgroundColor: MARKETPLACE_INFO[m].color }}
                  aria-hidden="true"
                >
                  {MARKETPLACE_INFO[m].code}
                </span>
                <div className="flex items-center gap-2">
                  <Flag code={hub.countryCode} />
                  <span className="text-sm font-medium text-ink dark:text-ivory">{m}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-line bg-card p-5 dark:border-dark-line dark:bg-dark-card">
            <p className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50">Currency</p>
            <p className="mt-2 text-sm text-ink dark:text-ivory">{hub.currency}</p>
          </div>
          <div className="rounded-3xl border border-line bg-card p-5 dark:border-dark-line dark:bg-dark-card">
            <p className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50">Typical shipping</p>
            <p className="mt-2 text-sm text-ink dark:text-ivory">{hub.typicalShipping}</p>
          </div>
          <div className="rounded-3xl border border-line bg-card p-5 dark:border-dark-line dark:bg-dark-card">
            <p className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50">Duty</p>
            <p className="mt-2 text-sm text-ink dark:text-ivory">{hub.dutyNote}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
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

      {error && (
        <p className="mt-8 rounded-2xl border border-bad/30 bg-bad-soft px-5 py-4 text-sm text-bad">{error}</p>
      )}

      {!scored && !error && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-3xl border border-line bg-card dark:border-dark-line dark:bg-dark-card"
            />
          ))}
        </div>
      )}

      {scored && scored.length === 0 && (
        <p className="mt-8 text-sm text-ink/60 dark:text-ivory/60">No sample listings in this category yet.</p>
      )}

      {scored && scored.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {scored.map((product, i) => (
            <ProductCard key={product.id} product={product} tileIndex={i} />
          ))}
        </div>
      )}

      <LearnTip>
        {hub.city}'s listings ship from {hub.country} — delivery windows and duty are typically longer and higher
        than domestic purchases, which is why we always show the delivered total up front.
      </LearnTip>

      <div className="mt-14">
        <h2 className="font-display text-xl text-ink dark:text-ivory">Visit another hub</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {otherHubs.map((other) => (
            <Link
              key={other.slug}
              to={`/destinations/${other.slug}`}
              className="flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-medium text-ink transition-colors hover:border-forest hover:text-forest dark:border-dark-line dark:bg-dark-card dark:text-ivory dark:hover:border-gold dark:hover:text-gold"
            >
              <Flag code={other.countryCode} />
              {other.city}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
        Sample data for the demo — prices, reviews and verdicts shown here are not real listings.
      </p>
    </div>
  );
}
