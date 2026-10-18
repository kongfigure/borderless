import { useEffect, useMemo, useState } from "react";
import type { Product } from "@shared/types";
import { landedCost, trustVerdict } from "@shared/calculations";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { IconicProductCard } from "@/components/IconicProductCard";
import { ICONIC_PRODUCTS } from "@/lib/iconicProducts";

export function Discover() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Couldn't reach the sample data API. Is the server running?"));
  }, []);

  const scored = useMemo(
    () =>
      products?.map((product) => ({
        ...product,
        landedCost: landedCost(product),
        verdictResult: trustVerdict(product),
      })) ?? null,
    [products]
  );

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

      {!scored && !error && (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-3xl border border-line bg-card dark:border-dark-line dark:bg-dark-card"
            />
          ))}
        </div>
      )}

      {scored && (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {scored.map((product, i) => (
            <ProductCard key={product.id} product={product} tileIndex={i} />
          ))}
        </div>
      )}

      <section className="mt-16">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Where things come from</p>
        <h2 className="mt-3 font-display text-2xl text-ink dark:text-ivory">Iconic finds</h2>
        <p className="mt-2 max-w-xl text-sm text-ink/60 dark:text-ivory/60">
          A few products with a real cultural story behind them, and where in the world they're from.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ICONIC_PRODUCTS.map((product) => (
            <IconicProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
        Sample data for the demo — prices, reviews and verdicts shown here are not real listings.
      </p>
    </div>
  );
}
