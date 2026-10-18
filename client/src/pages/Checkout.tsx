import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, Check, CheckCircle2, Loader2 } from "lucide-react";
import { rankCardOutcomes } from "@shared/rewards";
import { clearCart, loadCart, cartTotals, type CartItem } from "@/lib/cart";
import { addOrder } from "@/lib/orderHistory";
import { buildOrderLineItems, generateOrderId, saveOrder, type Order, type OrderDeliveryDetails } from "@/lib/orders";
import { formatCardNumber, generateVirtualCard, isValidExpiry, luhnCheck, SANDBOX_CARD_NUMBER } from "@/lib/payment";
import { CheckoutOrderSummary } from "@/components/CheckoutOrderSummary";
import { VirtualCardDisplay } from "@/components/VirtualCardDisplay";
import { LearnTip } from "@/components/LearnTip";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const EMPTY_DELIVERY: OrderDeliveryDetails = {
  name: "",
  address: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
  deadline: "",
};

const inputClass =
  "mt-1 min-h-[44px] w-full rounded-xl border border-line bg-transparent px-3 text-sm text-ink outline-none focus:border-forest dark:border-dark-line dark:text-ivory dark:focus:border-gold";
const labelClass = "text-xs font-medium text-ink/70 dark:text-ivory/70";

export function Checkout() {
  const [items] = useState<CartItem[]>(() => loadCart());

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return <CheckoutFlow items={items} />;
}

function CheckoutFlow({ items }: { items: CartItem[] }) {
  const navigate = useNavigate();
  const totals = cartTotals(items);
  const cardOutcomes = rankCardOutcomes(totals.totalUSD);
  const bestOutcome = cardOutcomes[0];
  const worstOutcome = cardOutcomes[cardOutcomes.length - 1];
  const savingsVsWorst = round2(worstOutcome.effectiveCostUSD - bestOutcome.effectiveCostUSD);

  const [selectedCardId, setSelectedCardId] = useState(bestOutcome.card.id);
  const selectedOutcome = cardOutcomes.find((o) => o.card.id === selectedCardId) ?? bestOutcome;

  const [delivery, setDelivery] = useState<OrderDeliveryDetails>(EMPTY_DELIVERY);
  const [deliveryTouched, setDeliveryTouched] = useState(false);

  const [virtualCard] = useState(() => generateVirtualCard());
  const [payNumber, setPayNumber] = useState(formatCardNumber(virtualCard.number));
  const [payExpiry, setPayExpiry] = useState(virtualCard.expiry);
  const [payCvc, setPayCvc] = useState(virtualCard.cvc);
  const [simulateDecline, setSimulateDecline] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [confirmChecked, setConfirmChecked] = useState(false);

  const isDeliveryValid =
    delivery.name.trim() !== "" &&
    delivery.address.trim() !== "" &&
    delivery.city.trim() !== "" &&
    delivery.postalCode.trim() !== "" &&
    delivery.country.trim() !== "";

  const merchantName = items.every((i) => i.marketplace === items[0].marketplace)
    ? items[0].marketplace
    : "Multiple stores";

  const currentStepNumber = !isDeliveryValid ? 1 : paymentStatus !== "success" ? 3 : 4;
  const steps = [
    { n: 1, label: "Delivery", done: isDeliveryValid },
    { n: 2, label: "Pick a card", done: isDeliveryValid },
    { n: 3, label: "Pay", done: paymentStatus === "success" },
    { n: 4, label: "Review", done: false },
  ];

  function fieldError(key: keyof OrderDeliveryDetails, label: string, required = true) {
    if (!required) return null;
    if (!deliveryTouched || delivery[key]?.trim()) return null;
    return (
      <p className="mt-1 text-xs text-bad">{label} is required.</p>
    );
  }

  async function handlePay(e: FormEvent) {
    e.preventDefault();
    setPaymentError(null);

    if (!isDeliveryValid) {
      setDeliveryTouched(true);
      setPaymentError("Complete delivery details first.");
      return;
    }

    const digits = payNumber.replace(/\D/g, "");
    if (digits.length !== 16) {
      setPaymentError("Enter a valid 16-digit card number.");
      return;
    }
    if (digits !== SANDBOX_CARD_NUMBER) {
      setPaymentError("Use the sandbox card above. Real cards are never accepted here.");
      return;
    }
    if (!luhnCheck(digits)) {
      setPaymentError("That card number failed a basic validity check.");
      return;
    }
    if (!isValidExpiry(payExpiry)) {
      setPaymentError("Enter a valid, unexpired expiry as MM/YY.");
      return;
    }
    if (!/^\d{3}$/.test(payCvc)) {
      setPaymentError("Enter a valid 3-digit CVC.");
      return;
    }

    setPaymentStatus("processing");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (simulateDecline) {
      setPaymentStatus("error");
      setPaymentError("Your sandbox card was declined. Try again, or turn off the decline toggle.");
      return;
    }

    setPaymentStatus("success");
  }

  function handlePlaceOrder() {
    if (!confirmChecked || paymentStatus !== "success") return;

    const order: Order = {
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      isSandbox: true,
      delivery,
      items: buildOrderLineItems(items),
      totals,
      rewardsCard: {
        id: selectedOutcome.card.id,
        name: selectedOutcome.card.name,
        feeUSD: selectedOutcome.feeUSD,
        rewardsUSD: selectedOutcome.rewardsUSD,
        effectiveCostUSD: selectedOutcome.effectiveCostUSD,
      },
      pointsEarned: selectedOutcome.pointsEarned,
      moneySavedVsWorstCardUSD: round2(worstOutcome.effectiveCostUSD - selectedOutcome.effectiveCostUSD),
      cardLastFour: virtualCard.lastFour,
    };

    saveOrder(order);

    const today = new Date().toISOString().slice(0, 10);
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        addOrder({
          itemName: item.itemName,
          priceUSD: item.landedCost.totalUSD,
          category: item.category,
          date: today,
          timesUsed: 0,
          lastUsedDaysAgo: 0,
        });
      }
    }

    clearCart();
    navigate(`/order/${order.id}`);
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-30 bg-gold/20 px-4 py-2.5 text-center text-xs font-medium text-ink dark:bg-gold/15 dark:text-ivory sm:text-sm">
        Sandbox checkout. No real payment is taken. Cards are made up.
      </div>

      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Pay safely</p>
        <h1 className="mt-3 font-display text-3xl text-ink dark:text-ivory sm:text-4xl">Checkout</h1>

        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
          {steps.map((step, i) => (
            <div key={step.n} className="flex shrink-0 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  step.done
                    ? "bg-forest text-ivory dark:bg-gold dark:text-dark-bg"
                    : step.n === currentStepNumber
                      ? "border-2 border-forest text-forest dark:border-gold dark:text-gold"
                      : "bg-line text-ink/50 dark:bg-dark-line dark:text-ivory/50"
                }`}
              >
                {step.done ? <Check size={14} aria-hidden="true" /> : step.n}
              </div>
              <span
                className={`hidden text-xs sm:inline ${
                  step.n === currentStepNumber
                    ? "font-semibold text-ink dark:text-ivory"
                    : "text-ink/50 dark:text-ivory/50"
                }`}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && <div className="h-px w-5 bg-line dark:bg-dark-line sm:w-8" />}
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="flex flex-col gap-6">
            {/* Step 1: Delivery details */}
            <section className="rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
              <h2 className="font-display text-xl text-ink dark:text-ivory">1. Delivery details</h2>
              <p className="mt-1 text-sm text-ink/60 dark:text-ivory/60">
                Fake data is fine for this sandbox — nothing here is sent anywhere.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-name" className={labelClass}>
                    Full name
                  </label>
                  <input
                    id="checkout-name"
                    value={delivery.name}
                    onChange={(e) => setDelivery((d) => ({ ...d, name: e.target.value }))}
                    onBlur={() => setDeliveryTouched(true)}
                    aria-required="true"
                    className={inputClass}
                  />
                  {fieldError("name", "Full name")}
                </div>
                <div>
                  <label htmlFor="checkout-address" className={labelClass}>
                    Street address
                  </label>
                  <input
                    id="checkout-address"
                    value={delivery.address}
                    onChange={(e) => setDelivery((d) => ({ ...d, address: e.target.value }))}
                    onBlur={() => setDeliveryTouched(true)}
                    aria-required="true"
                    className={inputClass}
                  />
                  {fieldError("address", "Street address")}
                </div>
                <div>
                  <label htmlFor="checkout-city" className={labelClass}>
                    City
                  </label>
                  <input
                    id="checkout-city"
                    value={delivery.city}
                    onChange={(e) => setDelivery((d) => ({ ...d, city: e.target.value }))}
                    onBlur={() => setDeliveryTouched(true)}
                    aria-required="true"
                    className={inputClass}
                  />
                  {fieldError("city", "City")}
                </div>
                <div>
                  <label htmlFor="checkout-region" className={labelClass}>
                    State / region (optional)
                  </label>
                  <input
                    id="checkout-region"
                    value={delivery.region}
                    onChange={(e) => setDelivery((d) => ({ ...d, region: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-postal" className={labelClass}>
                    Postal code
                  </label>
                  <input
                    id="checkout-postal"
                    value={delivery.postalCode}
                    onChange={(e) => setDelivery((d) => ({ ...d, postalCode: e.target.value }))}
                    onBlur={() => setDeliveryTouched(true)}
                    aria-required="true"
                    className={inputClass}
                  />
                  {fieldError("postalCode", "Postal code")}
                </div>
                <div>
                  <label htmlFor="checkout-country" className={labelClass}>
                    Country
                  </label>
                  <input
                    id="checkout-country"
                    value={delivery.country}
                    onChange={(e) => setDelivery((d) => ({ ...d, country: e.target.value }))}
                    onBlur={() => setDeliveryTouched(true)}
                    aria-required="true"
                    className={inputClass}
                  />
                  {fieldError("country", "Country")}
                </div>
                <div>
                  <label htmlFor="checkout-deadline" className={labelClass}>
                    Delivery deadline (optional)
                  </label>
                  <input
                    id="checkout-deadline"
                    type="date"
                    value={delivery.deadline}
                    onChange={(e) => setDelivery((d) => ({ ...d, deadline: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Rewards optimizer */}
            <section className="rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
              <h2 className="font-display text-xl text-ink dark:text-ivory">2. Pick a card</h2>
              <p className="mt-1 text-sm text-ink/60 dark:text-ivory/60">
                Demo cards, pre-selected to the lowest effective cost for this order.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {cardOutcomes.map((outcome) => {
                  const isBest = outcome.card.id === bestOutcome.card.id;
                  const isSelected = outcome.card.id === selectedCardId;
                  return (
                    <button
                      key={outcome.card.id}
                      type="button"
                      onClick={() => setSelectedCardId(outcome.card.id)}
                      aria-pressed={isSelected}
                      className={`flex min-h-[44px] flex-col gap-2 rounded-2xl border p-4 text-left transition-colors ${
                        isSelected
                          ? "border-forest bg-forest/5 dark:border-gold dark:bg-gold/10"
                          : "border-line bg-ivory hover:border-forest/40 dark:border-dark-line dark:bg-dark-bg dark:hover:border-gold/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-base text-ink dark:text-ivory">{outcome.card.name}</span>
                        {isBest && (
                          <span className="shrink-0 rounded-full bg-good-soft px-2 py-0.5 text-[10px] font-semibold text-good">
                            Best for this order
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-ink/50 dark:text-ivory/50">{outcome.card.description}</span>
                      <dl className="mt-1 flex flex-col gap-1 text-xs">
                        <div className="flex justify-between">
                          <dt className="text-ink/60 dark:text-ivory/60">Foreign fee</dt>
                          <dd className="text-ink dark:text-ivory">${outcome.feeUSD.toFixed(2)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-ink/60 dark:text-ivory/60">Rewards earned</dt>
                          <dd className="text-good">-${outcome.rewardsUSD.toFixed(2)}</dd>
                        </div>
                        <div className="flex justify-between border-t border-line pt-1 dark:border-dark-line">
                          <dt className="font-semibold text-ink dark:text-ivory">Effective cost</dt>
                          <dd className="font-display text-base text-forest dark:text-gold">
                            ${outcome.effectiveCostUSD.toFixed(2)}
                          </dd>
                        </div>
                      </dl>
                    </button>
                  );
                })}
              </div>

              {savingsVsWorst > 0 && (
                <p className="mt-4 text-sm font-medium text-forest dark:text-gold">
                  {bestOutcome.card.name} saves ${savingsVsWorst.toFixed(2)} vs the worst option for this order.
                </p>
              )}

              <p className="mt-3 text-sm text-ink/70 dark:text-ivory/70">
                Borderless points earned with {selectedOutcome.card.name}:{" "}
                <span className="font-semibold text-ink dark:text-ivory">{selectedOutcome.pointsEarned}</span>
              </p>
            </section>

            {/* Step 3: Pay with a one-time card */}
            <section className="rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
              <h2 className="font-display text-xl text-ink dark:text-ivory">3. Pay with a one-time card</h2>
              <p className="mt-1 text-sm text-ink/60 dark:text-ivory/60">
                A single-use sandbox virtual card, generated just for this order.
              </p>

              <div className="mt-5">
                <VirtualCardDisplay card={virtualCard} merchantName={merchantName} capUSD={totals.totalUSD} />
              </div>

              <form onSubmit={handlePay} className="mt-6 flex flex-col gap-4">
                <div>
                  <label htmlFor="pay-number" className={labelClass}>
                    Card number
                  </label>
                  <input
                    id="pay-number"
                    inputMode="numeric"
                    autoComplete="off"
                    value={payNumber}
                    onChange={(e) => setPayNumber(formatCardNumber(e.target.value))}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pay-expiry" className={labelClass}>
                      Expiry (MM/YY)
                    </label>
                    <input
                      id="pay-expiry"
                      autoComplete="off"
                      value={payExpiry}
                      onChange={(e) => setPayExpiry(e.target.value)}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <div>
                    <label htmlFor="pay-cvc" className={labelClass}>
                      CVC
                    </label>
                    <input
                      id="pay-cvc"
                      inputMode="numeric"
                      autoComplete="off"
                      value={payCvc}
                      onChange={(e) => setPayCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                <label className="flex min-h-[44px] items-center gap-2 text-sm text-ink/70 dark:text-ivory/70">
                  <input
                    type="checkbox"
                    checked={simulateDecline}
                    onChange={(e) => {
                      setSimulateDecline(e.target.checked);
                      setPaymentStatus("idle");
                      setPaymentError(null);
                    }}
                    className="h-4 w-4 rounded border-line dark:border-dark-line"
                  />
                  Simulate a declined card (for judges)
                </label>

                {paymentError && (
                  <p role="alert" className="flex items-center gap-2 rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">
                    <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
                    {paymentError}
                  </p>
                )}

                {paymentStatus === "success" && (
                  <p className="flex items-center gap-2 rounded-xl bg-good-soft px-4 py-3 text-sm text-good">
                    <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />
                    Payment authorized (sandbox) — ${totals.totalUSD.toFixed(2)} held on the one-time card.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={paymentStatus === "processing" || paymentStatus === "success"}
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-forest text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gold dark:text-dark-bg"
                >
                  {paymentStatus === "processing" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      Processing…
                    </>
                  ) : paymentStatus === "success" ? (
                    "Paid"
                  ) : paymentStatus === "error" ? (
                    "Try again"
                  ) : (
                    "Pay with sandbox card"
                  )}
                </button>
              </form>

              <LearnTip>Pay by card, never a bank transfer. Cards let you dispute a charge.</LearnTip>
            </section>

            {/* Step 4: Review and place order */}
            <section className="rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
              <h2 className="font-display text-xl text-ink dark:text-ivory">4. Review and place order</h2>

              <div className="mt-4 flex flex-col gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="shrink-0 text-ink/60 dark:text-ivory/60">Deliver to</span>
                  <span className="text-right text-ink dark:text-ivory">
                    {delivery.name || "—"}
                    <br />
                    {[delivery.address, delivery.city, delivery.region, delivery.postalCode, delivery.country]
                      .filter(Boolean)
                      .join(", ") || "Add delivery details above"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60 dark:text-ivory/60">Items</span>
                  <span className="text-ink dark:text-ivory">
                    {items.length} item{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60 dark:text-ivory/60">Card used</span>
                  <span className="text-ink dark:text-ivory">
                    {selectedOutcome.card.name} card &middot; one-time card ending {virtualCard.lastFour}
                  </span>
                </div>
                <div className="flex justify-between border-t border-line pt-3 dark:border-dark-line">
                  <span className="font-semibold text-ink dark:text-ivory">Total</span>
                  <span className="font-display text-xl text-forest dark:text-gold">
                    ${totals.totalUSD.toFixed(2)}
                  </span>
                </div>
              </div>

              <label className="mt-5 flex min-h-[44px] items-start gap-2 text-sm text-ink/80 dark:text-ivory/80">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-line dark:border-dark-line"
                />
                I understand this is a demo and no money moves.
              </label>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!confirmChecked || paymentStatus !== "success"}
                className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gold dark:text-dark-bg"
              >
                Place order
              </button>
              {paymentStatus !== "success" && (
                <p className="mt-2 text-xs text-ink/50 dark:text-ivory/50">Complete payment in step 3 first.</p>
              )}
            </section>
          </div>

          <div className="lg:sticky lg:top-24">
            <CheckoutOrderSummary items={items} totals={totals} />
          </div>
        </div>
      </div>
    </div>
  );
}
