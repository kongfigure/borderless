import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, Download, MapPin, PackageCheck, ShoppingBag, Sparkles } from "lucide-react";
import { downloadEvidenceFile, getOrder } from "@/lib/orders";
import { CheckoutOrderSummary } from "@/components/CheckoutOrderSummary";

export function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const order = id ? getOrder(id) : null;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  const placedAt = new Date(order.createdAt);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-good-soft text-good">
          <CheckCircle2 size={28} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <span className="mt-4 rounded-full bg-gold/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink dark:text-ivory">
          Sandbox order
        </span>
        <h1 className="mt-3 font-display text-3xl text-ink dark:text-ivory sm:text-4xl">Order placed</h1>
        <p className="mt-2 text-sm text-ink/60 dark:text-ivory/60">
          {order.id} &middot; {placedAt.toLocaleString()}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
            <h2 className="font-display text-xl text-ink dark:text-ivory">Delivery estimate</h2>
            <div className="mt-4 flex flex-col gap-3">
              {order.items.map((item, i) => (
                <div key={`${item.productId}-${i}`} className="flex items-center justify-between gap-3 text-sm">
                  <div className="overflow-hidden">
                    <p className="truncate text-ink dark:text-ivory">
                      {item.itemName}
                      {item.quantity > 1 && (
                        <span className="text-ink/50 dark:text-ivory/50"> &times;{item.quantity}</span>
                      )}
                    </p>
                    <p className="text-xs text-ink/50 dark:text-ivory/50">{item.marketplace}</p>
                  </div>
                  <span className="shrink-0 text-ink dark:text-ivory">
                    {new Date(item.promisedDeliveryDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
            <h2 className="font-display text-xl text-ink dark:text-ivory">Payment</h2>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60 dark:text-ivory/60">Card used</dt>
                <dd className="text-ink dark:text-ivory">
                  {order.rewardsCard.name} &middot; ending {order.cardLastFour}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60 dark:text-ivory/60">Points earned</dt>
                <dd className="font-semibold text-forest dark:text-gold">{order.pointsEarned}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60 dark:text-ivory/60">Saved vs worst card</dt>
                <dd className="font-semibold text-good">${order.moneySavedVsWorstCardUSD.toFixed(2)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
            <h2 className="font-display text-xl text-ink dark:text-ivory">Your evidence file</h2>
            <p className="mt-1 text-sm text-ink/60 dark:text-ivory/60">
              Keep this if you ever need to dispute the charge — order details, price breakdown and trust check, no
              card number.
            </p>
            <button
              type="button"
              onClick={() => downloadEvidenceFile(order)}
              className="mt-4 flex min-h-[44px] items-center gap-2 rounded-full border border-forest px-5 text-sm font-semibold text-forest transition-colors hover:bg-forest/5 dark:border-gold dark:text-gold dark:hover:bg-gold/10"
            >
              <Download size={16} aria-hidden="true" />
              Download evidence file
            </button>
          </section>

          <section className="rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
            <h2 className="font-display text-xl text-ink dark:text-ivory">What happens next</h2>
            <ol className="mt-4 flex flex-col gap-4">
              {[
                { icon: CheckCircle2, label: "Order placed", done: true },
                { icon: PackageCheck, label: "Seller ships", done: false },
                { icon: MapPin, label: "In transit, crossing borders", done: false },
                { icon: Sparkles, label: "Delivered", done: false },
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      step.done
                        ? "bg-forest text-ivory dark:bg-gold dark:text-dark-bg"
                        : "bg-line text-ink/50 dark:bg-dark-line dark:text-ivory/50"
                    }`}
                  >
                    <step.icon size={16} aria-hidden="true" />
                  </div>
                  <span
                    className={`text-sm ${
                      step.done ? "font-medium text-ink dark:text-ivory" : "text-ink/60 dark:text-ivory/60"
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-ink/40 dark:text-ivory/40">Demo timeline. Nothing was ordered.</p>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/group-buy"
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-forest text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] dark:bg-gold dark:text-dark-bg"
            >
              Track my parcel
            </Link>
            <Link
              to="/discover"
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full border border-line text-sm font-semibold text-ink transition-colors hover:bg-line/40 dark:border-dark-line dark:text-ivory dark:hover:bg-dark-line/40"
            >
              <ShoppingBag size={16} aria-hidden="true" />
              Keep shopping
            </Link>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <CheckoutOrderSummary items={order.items} totals={order.totals} />
        </div>
      </div>
    </div>
  );
}
