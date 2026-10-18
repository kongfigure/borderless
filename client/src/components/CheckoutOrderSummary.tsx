import { useState } from "react";
import { Home as HomeIcon } from "lucide-react";
import type { Category, LandedCost, Marketplace } from "@shared/types";
import { CATEGORY_ICON } from "@/lib/categoryIcon";
import { Flag } from "./Flag";
import { MarketplaceMark } from "./MarketplaceMark";

/** Loose enough to accept both a CartItem and an OrderLineItem — only the
 * fields the summary actually renders. */
interface SummaryLine {
  itemName: string;
  category: string;
  marketplace: string;
  countryCode: string;
  imageUrl?: string;
  quantity: number;
  landedCost: LandedCost;
}

export interface CheckoutTotals {
  itemPriceUSD: number;
  shippingUSD: number;
  dutyUSD: number;
  estimatedTaxUSD: number;
  totalUSD: number;
}

function SummaryThumb({ imageUrl, alt, category }: { imageUrl?: string; alt: string; category: string }) {
  const [failed, setFailed] = useState(false);
  const Icon = CATEGORY_ICON[category as Category] ?? HomeIcon;
  const showPhoto = !!imageUrl && !failed;

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-forest/10 dark:bg-gold/15">
      {showPhoto ? (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Icon size={20} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
      )}
    </div>
  );
}

export function CheckoutOrderSummary({ items, totals }: { items: SummaryLine[]; totals: CheckoutTotals }) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
      <h2 className="font-display text-lg text-ink dark:text-ivory">Order summary</h2>

      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={`${item.itemName}-${i}`} className="flex items-center gap-3">
            <SummaryThumb imageUrl={item.imageUrl} alt={item.itemName} category={item.category} />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm text-ink dark:text-ivory">
                {item.itemName}
                {item.quantity > 1 && (
                  <span className="text-ink/50 dark:text-ivory/50"> &times;{item.quantity}</span>
                )}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/50 dark:text-ivory/50">
                <Flag code={item.countryCode} />
                <MarketplaceMark marketplace={item.marketplace as Marketplace} size={14} />
                <span>{item.marketplace}</span>
              </div>
            </div>
            <span className="shrink-0 text-sm font-medium text-ink dark:text-ivory">
              ${(item.landedCost.totalUSD * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <dl className="flex flex-col gap-2 border-t border-line pt-4 text-sm dark:border-dark-line">
        <div className="flex justify-between">
          <dt className="text-ink/60 dark:text-ivory/60">Item subtotal</dt>
          <dd className="text-ink dark:text-ivory">${totals.itemPriceUSD.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/60 dark:text-ivory/60">Shipping</dt>
          <dd className="text-ink dark:text-ivory">${totals.shippingUSD.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/60 dark:text-ivory/60">Estimated US tariff</dt>
          <dd className="text-ink dark:text-ivory">${totals.dutyUSD.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/60 dark:text-ivory/60">Estimated tax</dt>
          <dd className="text-ink dark:text-ivory">${totals.estimatedTaxUSD.toFixed(2)}</dd>
        </div>
        <div className="mt-1 flex justify-between border-t border-line pt-2 dark:border-dark-line">
          <dt className="font-semibold text-ink dark:text-ivory">Total</dt>
          <dd className="font-display text-xl text-forest dark:text-gold">${totals.totalUSD.toFixed(2)}</dd>
        </div>
      </dl>
      <p className="text-xs text-ink/40 dark:text-ivory/40">Rates change. Actual charges depend on customs.</p>
    </div>
  );
}
