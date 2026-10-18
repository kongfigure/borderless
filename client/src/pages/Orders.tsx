import { Link } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { loadOrders } from "@/lib/orders";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { Flag } from "@/components/Flag";
import { MarketplaceMark } from "@/components/MarketplaceMark";
import type { Marketplace } from "@shared/types";

export function Orders() {
  const orders = loadOrders();

  if (orders.length === 0) {
    return (
      <PlaceholderPage
        icon={PackageSearch}
        eyebrow="Pay safely"
        title="Your orders"
        description="No sandbox orders yet. Add something to your cart and check out to see it here."
        comingNote="Sample data from a hackathon demo — nothing is actually shipped."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Pay safely</p>
      <h1 className="mt-3 font-display text-4xl text-ink dark:text-ivory">Your orders</h1>
      <p className="mt-3 max-w-xl text-ink/70 dark:text-ivory/70">Sandbox orders placed in this demo.</p>

      <div className="mt-8 flex flex-col gap-3">
        {[...orders].reverse().map((order) => (
          <Link
            key={order.id}
            to={`/order/${order.id}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-card px-5 py-4 transition-colors hover:border-forest/40 dark:border-dark-line dark:bg-dark-card dark:hover:border-gold/40"
          >
            <div className="overflow-hidden">
              <p className="font-display text-lg text-ink dark:text-ivory">{order.id}</p>
              <p className="text-xs text-ink/50 dark:text-ivory/50">
                {new Date(order.createdAt).toLocaleDateString()} &middot; {order.items.length} item
                {order.items.length === 1 ? "" : "s"}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                {[...new Set(order.items.map((item) => item.marketplace))].slice(0, 4).map((marketplace) => (
                  <MarketplaceMark key={marketplace} marketplace={marketplace as Marketplace} size={16} />
                ))}
                {[...new Set(order.items.map((item) => item.countryCode))].slice(0, 4).map((code) => (
                  <Flag key={code} code={code} />
                ))}
              </div>
            </div>
            <p className="shrink-0 font-display text-xl text-forest dark:text-gold">
              ${order.totals.totalUSD.toFixed(2)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
