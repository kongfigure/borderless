import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { clearCart, loadCart, type CartItem } from "@/lib/cart";
import { addOrder } from "@/lib/orderHistory";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [justCheckedOut, setJustCheckedOut] = useState(false);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  if (items.length === 0 && !justCheckedOut) {
    return (
      <PlaceholderPage
        icon={ShoppingBag}
        eyebrow="Pay safely"
        title="Cart & checkout"
        description="Your bag is empty. Add something from a product page, then come back here for a sandbox checkout."
        comingNote="Rewards-card optimisation and dispute evidence files are a later phase of this demo."
      />
    );
  }

  const total = items.reduce((sum, item) => sum + item.priceUSD, 0);

  const completeCheckout = () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const item of items) {
      addOrder({
        itemName: item.itemName,
        priceUSD: item.priceUSD,
        category: item.category,
        date: today,
        timesUsed: 0,
        lastUsedDaysAgo: 0,
      });
    }
    clearCart();
    setItems([]);
    setJustCheckedOut(true);
  };

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

      {justCheckedOut ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-line bg-card p-10 text-center dark:border-dark-line dark:bg-dark-card">
          <CheckCircle2 size={36} strokeWidth={1.5} className="text-good" aria-hidden="true" />
          <p className="font-display text-xl text-ink dark:text-ivory">Sandbox checkout complete</p>
          <p className="max-w-sm text-sm text-ink/60 dark:text-ivory/60">
            Added to your order history. Check it out on the Deinfluence page.
          </p>
          <Link
            to="/deinfluence"
            className="mt-2 flex min-h-[44px] items-center rounded-full bg-forest px-6 text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] dark:bg-gold dark:text-dark-bg"
          >
            View order history
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3">
            {items.map((item, i) => (
              <div
                key={`${item.id}-${i}`}
                className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3 dark:border-dark-line dark:bg-dark-card"
              >
                <div>
                  <p className="text-sm text-ink dark:text-ivory">{item.itemName}</p>
                  <p className="text-xs text-ink/50 dark:text-ivory/50">{item.category}</p>
                </div>
                <p className="font-display text-lg text-ink dark:text-ivory">${item.priceUSD.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-line/40 px-5 py-4 dark:bg-dark-line/40">
            <span className="font-semibold text-ink dark:text-ivory">Total</span>
            <span className="font-display text-2xl text-forest dark:text-gold">${total.toFixed(2)}</span>
          </div>

          <button
            type="button"
            onClick={completeCheckout}
            className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] dark:bg-gold dark:text-dark-bg"
          >
            Complete sandbox checkout (demo)
          </button>
        </>
      )}

      <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
        Sample data for the demo — no real payment or shipment happens here.
      </p>
    </div>
  );
}
