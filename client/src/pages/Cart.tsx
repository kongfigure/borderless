import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, ShoppingBag } from "lucide-react";
import type { Category, Marketplace } from "@shared/types";
import { cartTotals, loadCart, type CartItem } from "@/lib/cart";
import { CATEGORY_ICON } from "@/lib/categoryIcon";
import { Flag } from "@/components/Flag";
import { MarketplaceMark } from "@/components/MarketplaceMark";
import { PlaceholderPage } from "@/components/PlaceholderPage";

function CartThumb({ item }: { item: CartItem }) {
  const [failed, setFailed] = useState(false);
  const Icon = CATEGORY_ICON[item.category as Category] ?? HomeIcon;
  const showPhoto = !!item.imageUrl && !failed;

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-forest/10 dark:bg-gold/15">
      {showPhoto ? (
        <img
          src={item.imageUrl}
          alt={item.itemName}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Icon size={22} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
      )}
    </div>
  );
}

export function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  if (items.length === 0) {
    return (
      <PlaceholderPage
        icon={ShoppingBag}
        eyebrow="Pay safely"
        title="Cart & checkout"
        description="Your bag is empty. Add something from a product page, then come back here for a sandbox checkout."
        comingNote="Rewards-card optimisation and dispute evidence files happen at checkout."
      />
    );
  }

  const totals = cartTotals(items);

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Pay safely</p>
      <h1 className="mt-3 flex items-center gap-2 font-display text-4xl text-ink dark:text-ivory">
        <ShoppingBag size={32} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
        Cart &amp; checkout
      </h1>
      <p className="mt-3 max-w-xl text-ink/70 dark:text-ivory/70">
        A sandbox checkout for the demo — no real payment happens here.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {items.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 dark:border-dark-line dark:bg-dark-card"
          >
            <CartThumb item={item} />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm text-ink dark:text-ivory">
                {item.itemName}
                {item.quantity > 1 && <span className="text-ink/50 dark:text-ivory/50"> &times;{item.quantity}</span>}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-ink/50 dark:text-ivory/50">
                <Flag code={item.countryCode} />
                <MarketplaceMark marketplace={item.marketplace as Marketplace} size={14} />
                <span>{item.marketplace}</span>
              </div>
            </div>
            <p className="shrink-0 font-display text-lg text-ink dark:text-ivory">
              ${(item.landedCost.totalUSD * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-line/40 px-5 py-4 dark:bg-dark-line/40">
        <span className="font-semibold text-ink dark:text-ivory">Total</span>
        <span className="font-display text-2xl text-forest dark:text-gold">${totals.totalUSD.toFixed(2)}</span>
      </div>

      <Link
        to="/checkout"
        className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] dark:bg-gold dark:text-dark-bg"
      >
        Checkout
      </Link>

      <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
        Sample data for the demo — no real payment or shipment happens here.
      </p>
    </div>
  );
}
