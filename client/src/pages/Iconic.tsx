import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Droplet, Home as HomeIcon, Shirt, UtensilsCrossed } from "lucide-react";
import { ICONIC_PRODUCTS, type IconicCategory } from "@/lib/iconicProducts";
import { fetchOriginStory, type OriginStoryResponse } from "@/lib/api";
import { Flag } from "@/components/Flag";
import { OriginMap } from "@/components/OriginMap";
import { LearnTip } from "@/components/LearnTip";

const CATEGORY_ICON: Record<IconicCategory, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  skincare: Droplet,
  home: HomeIcon,
  clothing: Shirt,
};

export function Iconic() {
  const { id } = useParams<{ id: string }>();
  const product = ICONIC_PRODUCTS.find((p) => p.id === id);
  const [storyResult, setStoryResult] = useState<OriginStoryResponse | null>(null);

  useEffect(() => {
    if (!product) return;
    setStoryResult(null);
    fetchOriginStory({
      productName: product.productName,
      brand: product.brand,
      originCountry: product.originCountry,
      category: product.category,
      fallbackStory: product.story,
    })
      .then(setStoryResult)
      .catch(() => setStoryResult({ story: product.story, source: "fallback" }));
  }, [product]);

  if (!product) {
    return <Navigate to="/discover" replace />;
  }

  const Icon = CATEGORY_ICON[product.category];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <Link
        to="/discover"
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-forest dark:text-ivory/60 dark:hover:text-gold"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Discover
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/5 dark:bg-gold/10">
          <Icon size={28} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Flag code={product.originCountryCode} />
            <span className="text-sm text-ink/60 dark:text-ivory/60">{product.originCountry}</span>
          </div>
          <h1 className="font-display text-3xl text-ink dark:text-ivory">{product.productName}</h1>
        </div>
      </div>
      <p className="mt-1 text-sm text-ink/50 dark:text-ivory/50">{product.brand}</p>

      <section className="mt-8 rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
        <h2 className="font-display text-lg text-ink dark:text-ivory">Where it's from</h2>
        <div className="mt-4">
          <OriginMap originCountryName={product.originCountry.split(" & ")[0]} originCoordinates={product.originCoordinates} />
        </div>
        <p className="mt-4 text-sm text-ink/80 dark:text-ivory/80">{storyResult?.story ?? product.story}</p>
        <span className="mt-3 inline-block rounded-full bg-line px-3 py-1 text-[10px] font-medium text-ink/60 dark:bg-dark-line dark:text-ivory/60">
          {storyResult?.source === "live" ? "AI-written summary" : "Sample story"}
        </span>
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
        <h2 className="font-display text-lg text-ink dark:text-ivory">Shipping to the US</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-ivory/70">{product.shippingNote}</p>
        {product.extraNote && (
          <p className="mt-3 rounded-2xl border border-warn/30 bg-warn-soft px-4 py-3 text-xs text-warn">
            {product.extraNote}
          </p>
        )}
        <p className="mt-4 font-display text-xl text-forest dark:text-gold">${product.priceUSD.toFixed(2)} (sample)</p>
      </section>

      <LearnTip>
        We only state origin facts we're confident are accurate — when a detail isn't well known, we keep the story
        general instead of guessing.
      </LearnTip>

      <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
        Sample data for the demo — price and shipping estimate shown here are not a real listing.
      </p>
    </div>
  );
}
