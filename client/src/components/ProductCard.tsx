import { Armchair, Bookmark, Home as HomeIcon, Shirt } from "lucide-react";
import type { ScoredProduct } from "@shared/types";
import { Flag } from "./Flag";
import { getBadge, BADGE_STYLES } from "@/lib/verdict";
import { MARKETPLACE_INFO } from "@/lib/marketplaces";

const CATEGORY_ICON = { Furniture: Armchair, "Home Goods": HomeIcon, Clothing: Shirt } as const;

const TILE_TONES = ["bg-forest/10", "bg-gold/15", "bg-forest/5"];

export function ProductCard({
  product,
  tileIndex = 0,
  onSave,
  saved = false,
}: {
  product: ScoredProduct;
  tileIndex?: number;
  onSave?: (id: string) => void;
  saved?: boolean;
}) {
  const Icon = CATEGORY_ICON[product.category];
  const badge = getBadge(product);
  const marketplace = MARKETPLACE_INFO[product.marketplace];

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-4 transition-transform hover:-translate-y-1 dark:border-dark-line dark:bg-dark-card">
      <div
        className={`relative flex h-40 items-center justify-center rounded-2xl ${TILE_TONES[tileIndex % TILE_TONES.length]}`}
      >
        <Icon size={48} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${BADGE_STYLES[badge.tone]}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center gap-2">
          <Flag code={product.countryCode} />
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-ivory"
            style={{ backgroundColor: marketplace.color }}
            aria-hidden="true"
          >
            {marketplace.code}
          </span>
          <span className="text-xs text-ink/50 dark:text-ivory/50">{product.marketplace}</span>
        </div>

        <p className="mt-1 font-display text-lg text-ink dark:text-ivory">{product.title}</p>

        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xs text-ink/50 dark:text-ivory/50">${product.itemPriceUSD.toFixed(2)} item</span>
          <span className="font-display text-2xl text-forest dark:text-gold">
            ${product.landedCost.totalUSD.toFixed(2)}
          </span>
        </div>
        <p className="text-right text-xs text-ink/50 dark:text-ivory/50">
          {product.fulfillment === "pre_order" ? "ships in about 3 weeks" : `${product.deliveryDays} days to your door`}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onSave?.(product.id)}
        aria-pressed={saved}
        className="flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line text-sm font-medium text-ink transition-colors hover:border-forest hover:text-forest dark:border-dark-line dark:text-ivory dark:hover:border-gold dark:hover:text-gold"
      >
        <Bookmark size={16} className={saved ? "fill-current" : ""} aria-hidden="true" />
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
