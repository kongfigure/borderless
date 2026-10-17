import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Info, XCircle } from "lucide-react";
import type { Product as ProductType, ScoredProduct } from "@shared/types";
import { landedCost, trustVerdict } from "@shared/calculations";
import { fetchProducts } from "@/lib/api";
import { Flag } from "@/components/Flag";
import { LearnTip } from "@/components/LearnTip";
import { getBadge, BADGE_STYLES } from "@/lib/verdict";
import { MARKETPLACE_INFO } from "@/lib/marketplaces";

const SIGNAL_ICON = { good: CheckCircle2, bad: XCircle, info: Info } as const;
const SIGNAL_COLOR = {
  good: "text-good",
  bad: "text-bad",
  info: "text-ink/50 dark:text-ivory/50",
} as const;

function score(product: ProductType): ScoredProduct {
  return { ...product, landedCost: landedCost(product), verdictResult: trustVerdict(product) };
}

export function Product() {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<ProductType[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>(id);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Couldn't reach the sample data API. Is the server running?"));
  }, []);

  useEffect(() => {
    setSelectedId(id);
    setAdded(false);
  }, [id]);

  const main = useMemo(() => products?.find((p) => p.id === id) ?? null, [products, id]);

  const group: ScoredProduct[] = useMemo(() => {
    if (!products || !main?.comparisonGroup) return [];
    return products
      .filter((p) => p.comparisonGroup === main.comparisonGroup)
      .map(score)
      .sort((a, b) => a.landedCost.totalUSD - b.landedCost.totalUSD);
  }, [products, main]);

  const scoredMain = useMemo(() => (main ? score(main) : null), [main]);
  const selected = group.length > 0 ? group.find((g) => g.id === selectedId) ?? scoredMain : scoredMain;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <p className="rounded-2xl border border-bad/30 bg-bad-soft px-5 py-4 text-sm text-bad">{error}</p>
      </div>
    );
  }

  if (products && !main) {
    return <Navigate to="/discover" replace />;
  }

  if (!selected) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="h-96 animate-pulse rounded-3xl border border-line bg-card dark:border-dark-line dark:bg-dark-card" />
      </div>
    );
  }

  const badge = getBadge(selected);
  const marketplace = MARKETPLACE_INFO[selected.marketplace];
  const lowestTotal = group.length > 0 ? group[0].landedCost.totalUSD : selected.landedCost.totalUSD;
  const highestTotal = group.length > 0 ? group[group.length - 1].landedCost.totalUSD : selected.landedCost.totalUSD;
  const savings = highestTotal - lowestTotal;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <Link
        to="/discover"
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-forest dark:text-ivory/60 dark:hover:text-gold"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Discover
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Flag code={selected.countryCode} />
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-ivory"
          style={{ backgroundColor: marketplace.color }}
          aria-hidden="true"
        >
          {marketplace.code}
        </span>
        <span className="text-sm text-ink/60 dark:text-ivory/60">
          {selected.marketplace} &middot; {selected.country}
        </span>
        {selected.condition && (
          <span className="rounded-full bg-line px-3 py-1 text-xs font-medium text-ink/70 dark:bg-dark-line dark:text-ivory/70">
            {selected.condition} condition
          </span>
        )}
      </div>

      <h1 className="mt-3 font-display text-3xl text-ink dark:text-ivory sm:text-4xl">{selected.title}</h1>
      {selected.titleTranslated && (
        <p className="mt-1 text-sm text-ink/50 dark:text-ivory/50">Original listing: {selected.titleTranslated}</p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink dark:text-ivory">Delivered cost</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGE_STYLES[badge.tone]}`}>
              {badge.label}
            </span>
          </div>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60 dark:text-ivory/60">Item price</dt>
              <dd className="text-ink dark:text-ivory">${selected.landedCost.itemPriceUSD.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60 dark:text-ivory/60">Shipping</dt>
              <dd className="text-ink dark:text-ivory">${selected.landedCost.shippingUSD.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60 dark:text-ivory/60">Duty (demo, 15%)</dt>
              <dd className="text-ink dark:text-ivory">${selected.landedCost.dutyUSD.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60 dark:text-ivory/60">Estimated tax (demo, 8%)</dt>
              <dd className="text-ink dark:text-ivory">${selected.landedCost.estimatedTaxUSD.toFixed(2)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-line pt-2 dark:border-dark-line">
              <dt className="font-semibold text-ink dark:text-ivory">Total to your door</dt>
              <dd className="font-display text-xl text-forest dark:text-gold">
                ${selected.landedCost.totalUSD.toFixed(2)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-ink/50 dark:text-ivory/50">
            {selected.fulfillment === "pre_order"
              ? "Ships in about 3 weeks (pre-order)."
              : `${selected.deliveryDays} days to your door.`}
          </p>

          <button
            type="button"
            onClick={() => setAdded(true)}
            className="mt-5 flex min-h-[44px] w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] dark:bg-gold dark:text-dark-bg"
          >
            {added ? `Added · $${selected.landedCost.totalUSD.toFixed(2)}` : `Add to bag · $${selected.landedCost.totalUSD.toFixed(2)}`}
          </button>
        </div>

        <div className="rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
          <h2 className="font-display text-lg text-ink dark:text-ivory">Trust signals</h2>
          <p className="mt-1 text-xs text-ink/50 dark:text-ivory/50">A guide from public signals, not proof.</p>
          <ul className="mt-4 flex flex-col gap-3">
            {selected.verdictResult.signals.map((s) => {
              const Icon = SIGNAL_ICON[s.tone];
              return (
                <li key={s.id} className="flex items-start gap-2 text-sm text-ink/80 dark:text-ivory/80">
                  <Icon size={16} className={`mt-0.5 shrink-0 ${SIGNAL_COLOR[s.tone]}`} aria-hidden="true" />
                  {s.reason}
                </li>
              );
            })}
          </ul>
          {selected.trust.reviewNotes && (
            <p className="mt-4 rounded-2xl bg-line/40 px-4 py-3 text-xs text-ink/60 dark:bg-dark-line/60 dark:text-ivory/60">
              &ldquo;{selected.trust.reviewNotes}&rdquo;
            </p>
          )}
        </div>
      </div>

      {group.length > 1 && (
        <section className="mt-10">
          <h2 className="font-display text-xl text-ink dark:text-ivory">One product, several stores</h2>
          <p className="mt-1 text-sm text-ink/60 dark:text-ivory/60">
            Sample data showing the same item listed across marketplaces. Select one to update the price and the
            Add to bag button above.
          </p>
          {savings > 0 && (
            <p className="mt-2 text-sm font-medium text-forest dark:text-gold">
              You save ${savings.toFixed(2)} versus the highest delivered price.
            </p>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.map((item) => {
              const isSelected = item.id === selected.id;
              const isLowest = item.landedCost.totalUSD === lowestTotal;
              const itemBadge = getBadge(item);
              const mkt = MARKETPLACE_INFO[item.marketplace];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setAdded(false);
                  }}
                  aria-pressed={isSelected}
                  className={`flex min-h-[44px] flex-col gap-2 rounded-2xl border p-4 text-left transition-colors ${
                    isSelected
                      ? "border-forest bg-forest/5 dark:border-gold dark:bg-gold/10"
                      : "border-line bg-card hover:border-forest/40 dark:border-dark-line dark:bg-dark-card dark:hover:border-gold/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Flag code={item.countryCode} />
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-ivory"
                        style={{ backgroundColor: mkt.color }}
                        aria-hidden="true"
                      >
                        {mkt.code}
                      </span>
                      <span className="text-xs text-ink/60 dark:text-ivory/60">{item.marketplace}</span>
                    </div>
                    {isLowest && (
                      <span className="shrink-0 rounded-full bg-good-soft px-2 py-0.5 text-[10px] font-semibold text-good">
                        Lowest delivered price
                      </span>
                    )}
                  </div>
                  <span className="font-display text-xl text-ink dark:text-ivory">
                    ${item.landedCost.totalUSD.toFixed(2)}
                  </span>
                  <span className="text-xs text-ink/50 dark:text-ivory/50">
                    ${item.landedCost.itemPriceUSD.toFixed(2)} item + $
                    {(item.landedCost.shippingUSD + item.landedCost.dutyUSD + item.landedCost.estimatedTaxUSD).toFixed(2)}{" "}
                    shipping, duty &amp; tax
                  </span>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${BADGE_STYLES[itemBadge.tone]}`}>
                      {itemBadge.label}
                    </span>
                    <span className="text-xs text-ink/50 dark:text-ivory/50">{item.deliveryDays} days</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <LearnTip>
        The item price is rarely the full story — shipping, duty and tax can add 20% or more once a listing crosses
        a border. That's why we always compare the delivered total, not the sticker price.
      </LearnTip>

      <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
        Sample data for the demo — prices, reviews and verdicts shown here are not real listings. Verdicts are a
        guide from public signals, not proof.
      </p>
    </div>
  );
}
