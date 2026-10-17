import { useEffect, useState } from "react";
import { Armchair, Home as HomeIcon, Shirt } from "lucide-react";
import type { Product, Verdict } from "@shared/types";
import { fetchProducts } from "@/lib/api";

const categoryIcon = { Furniture: Armchair, "Home Goods": HomeIcon, Clothing: Shirt } as const;

const verdictStyles: Record<Verdict, string> = {
  "Looks good": "bg-good-soft text-good",
  "Pre-order": "bg-warn-soft text-warn",
  Skip: "bg-bad-soft text-bad",
  "Not enough info": "bg-line text-ink/60 dark:bg-dark-line dark:text-ivory/60",
};

const tileTones = ["bg-forest/10", "bg-gold/15", "bg-forest/5"];

export function Discover() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Couldn't reach the sample data API. Is the server running?"));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Curated global discoveries</p>
      <h1 className="mt-3 font-display text-4xl text-ink dark:text-ivory">Discover</h1>
      <p className="mt-3 max-w-xl text-ink/70 dark:text-ivory/70">
        Sample listings pulled from our demo API, across furniture, home goods and clothing. All data below is
        made up for the demo.
      </p>

      {error && (
        <p className="mt-8 rounded-2xl border border-bad/30 bg-bad-soft px-5 py-4 text-sm text-bad">{error}</p>
      )}

      {!products && !error && (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-3xl border border-line bg-card dark:border-dark-line dark:bg-dark-card"
            />
          ))}
        </div>
      )}

      {products && (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => {
            const Icon = categoryIcon[product.category];
            return (
              <div
                key={product.id}
                className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-4 transition-transform hover:-translate-y-1 dark:border-dark-line dark:bg-dark-card"
              >
                <div
                  className={`relative flex h-40 items-center justify-center rounded-2xl ${tileTones[i % tileTones.length]}`}
                >
                  <Icon size={48} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${verdictStyles[product.verdict]}`}
                  >
                    {product.verdict}
                  </span>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <p className="text-xs text-ink/50 dark:text-ivory/50">
                    {product.marketplace} · {product.country}
                  </p>
                  <p className="font-display text-lg text-ink dark:text-ivory">{product.title}</p>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-display text-2xl text-forest dark:text-gold">
                      ${product.cost.totalUSD.toFixed(2)}
                    </span>
                    <span className="text-xs text-ink/50 dark:text-ivory/50">
                      {product.deliveryDays} days to your door
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
        Sample data for the demo — prices, reviews and verdicts shown here are not real listings.
      </p>
    </div>
  );
}
