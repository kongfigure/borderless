import { Link } from "react-router-dom";
import { Droplet, Home as HomeIcon, Shirt, UtensilsCrossed } from "lucide-react";
import type { IconicCategory, IconicProduct } from "@/lib/iconicProducts";
import { Flag } from "@/components/Flag";

const CATEGORY_ICON: Record<IconicCategory, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  skincare: Droplet,
  home: HomeIcon,
  clothing: Shirt,
};

export function IconicProductCard({ product }: { product: IconicProduct }) {
  const Icon = CATEGORY_ICON[product.category];

  return (
    <Link
      to={`/iconic/${product.id}`}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-5 transition-transform hover:-translate-y-1 dark:border-dark-line dark:bg-dark-card"
    >
      <div className="flex h-28 items-center justify-center rounded-2xl bg-forest/5 dark:bg-gold/10">
        <Icon size={36} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-2">
        <Flag code={product.originCountryCode} />
        <span className="text-xs text-ink/50 dark:text-ivory/50">{product.originCountry}</span>
      </div>
      <p className="font-display text-lg text-ink dark:text-ivory">{product.productName}</p>
      <p className="text-xs text-ink/50 dark:text-ivory/50">{product.brand}</p>
      <p className="mt-auto text-sm text-ink/70 dark:text-ivory/70">${product.priceUSD.toFixed(2)} (sample)</p>
    </Link>
  );
}
