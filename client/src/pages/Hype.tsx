import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { hypeCheck, type HypeCheckResponse } from "@/lib/api";
import { LearnTip } from "@/components/LearnTip";

interface HypeExample {
  match: string;
  typicalLowUSD: number;
  typicalHighUSD: number;
  cheaperAlternative: { name: string; priceUSD: number };
}

/** Small set of sample comparables, matched by keyword. Anything else falls
 * back to a price-ratio heuristic below — both paths are made-up demo
 * numbers, never real market data. */
const HYPE_EXAMPLES: HypeExample[] = [
  {
    match: "chair",
    typicalLowUSD: 150,
    typicalHighUSD: 210,
    cheaperAlternative: { name: "Moss accent chair", priceUSD: 165 },
  },
  {
    match: "tumbler",
    typicalLowUSD: 18,
    typicalHighUSD: 28,
    cheaperAlternative: { name: "Classic insulated tumbler", priceUSD: 22 },
  },
  {
    match: "blender",
    typicalLowUSD: 20,
    typicalHighUSD: 32,
    cheaperAlternative: { name: "Basic single-serve blender", priceUSD: 24 },
  },
  {
    match: "serum",
    typicalLowUSD: 18,
    typicalHighUSD: 30,
    cheaperAlternative: { name: "Drugstore vitamin C serum", priceUSD: 14 },
  },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function getComparables(itemName: string, priceUSD: number): Omit<HypeExample, "match"> {
  const normalized = itemName.trim().toLowerCase();
  const hit = HYPE_EXAMPLES.find((ex) => normalized.includes(ex.match));
  if (hit) return hit;

  return {
    typicalLowUSD: round2(priceUSD * 0.52),
    typicalHighUSD: round2(priceUSD * 0.73),
    cheaperAlternative: { name: "A similar alternative", priceUSD: round2(priceUSD * 0.57) },
  };
}

export function Hype() {
  const [itemName, setItemName] = useState("Viral cloud chair");
  const [price, setPrice] = useState(289);
  const [timesPerWeek, setTimesPerWeek] = useState(7);
  const [weeks, setWeeks] = useState(52);

  const [result, setResult] = useState<HypeCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const comparables = useMemo(() => getComparables(itemName, price), [itemName, price]);
  const totalUses = Math.max(1, Math.round(timesPerWeek * weeks));
  const costPerUse = round2(price / totalUses);
  const isAboveRange = price > comparables.typicalHighUSD;
  const gaugeMax = Math.max(price, comparables.typicalHighUSD) * 1.15;
  const gaugePercent = (value: number) => Math.min(100, (value / gaugeMax) * 100);

  const runCheck = () => {
    if (!itemName.trim() || price <= 0) return;
    setIsLoading(true);
    setError(null);
    hypeCheck({
      itemName: itemName.trim(),
      priceUSD: price,
      typicalLowUSD: comparables.typicalLowUSD,
      typicalHighUSD: comparables.typicalHighUSD,
      costPerUseUSD: costPerUse,
      cheaperAlternative: comparables.cheaperAlternative,
    })
      .then(setResult)
      .catch((err: Error) => setError(err.message || "Something went wrong checking the hype."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Is it worth the hype?</p>
      <h1 className="mt-3 flex items-center gap-2 font-display text-4xl text-ink dark:text-ivory">
        <Sparkles size={32} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
        Hype Check
      </h1>
      <p className="mt-3 max-w-xl text-ink/70 dark:text-ivory/70">
        Drop in a trending item and we'll weigh it against its usual price range, a cost-per-use estimate, and a
        cheaper similar option.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCheck();
        }}
        className="mt-8 rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
          <div>
            <label htmlFor="hype-item" className="text-xs font-medium uppercase tracking-wide text-ink/50 dark:text-ivory/50">
              Item name
            </label>
            <input
              id="hype-item"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-ivory px-4 text-sm text-ink outline-none focus:border-forest dark:border-dark-line dark:bg-dark-bg dark:text-ivory dark:focus:border-gold"
            />
          </div>
          <div>
            <label htmlFor="hype-price" className="text-xs font-medium uppercase tracking-wide text-ink/50 dark:text-ivory/50">
              Price (USD)
            </label>
            <input
              id="hype-price"
              type="number"
              min={1}
              step={1}
              value={price}
              onChange={(e) => setPrice(Math.max(1, Number(e.target.value) || 0))}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-ivory px-4 text-sm text-ink outline-none focus:border-forest dark:border-dark-line dark:bg-dark-bg dark:text-ivory dark:focus:border-gold"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hype-times" className="text-xs font-medium uppercase tracking-wide text-ink/50 dark:text-ivory/50">
              Times used per week
            </label>
            <input
              id="hype-times"
              type="number"
              min={1}
              max={21}
              value={timesPerWeek}
              onChange={(e) => setTimesPerWeek(Math.min(21, Math.max(1, Number(e.target.value) || 1)))}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-ivory px-4 text-sm text-ink outline-none focus:border-forest dark:border-dark-line dark:bg-dark-bg dark:text-ivory dark:focus:border-gold"
            />
          </div>
          <div>
            <label htmlFor="hype-weeks" className="text-xs font-medium uppercase tracking-wide text-ink/50 dark:text-ivory/50">
              Weeks you'll keep using it
            </label>
            <input
              id="hype-weeks"
              type="number"
              min={1}
              max={260}
              value={weeks}
              onChange={(e) => setWeeks(Math.min(260, Math.max(1, Number(e.target.value) || 1)))}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-ivory px-4 text-sm text-ink outline-none focus:border-forest dark:border-dark-line dark:bg-dark-bg dark:text-ivory dark:focus:border-gold"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-full bg-forest text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] sm:w-auto sm:px-8 dark:bg-gold dark:text-dark-bg"
        >
          Check the hype
        </button>
      </form>

      <section className="mt-8 rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
        <h2 className="font-display text-lg text-ink dark:text-ivory">Price vs. usual range</h2>
        <div className="mt-4 h-3 w-full rounded-full bg-line dark:bg-dark-line">
          <div
            className="h-3 rounded-full bg-good/40"
            style={{
              marginLeft: `${gaugePercent(comparables.typicalLowUSD)}%`,
              width: `${gaugePercent(comparables.typicalHighUSD) - gaugePercent(comparables.typicalLowUSD)}%`,
            }}
          />
        </div>
        <div className="relative mt-1 h-4">
          <span
            className={`absolute -translate-x-1/2 text-xs font-semibold ${isAboveRange ? "text-bad" : "text-forest dark:text-gold"}`}
            style={{ left: `${gaugePercent(price)}%` }}
          >
            ▲
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-ink/70 dark:text-ivory/70">
          <span>
            Usual range: ${comparables.typicalLowUSD.toFixed(0)}–${comparables.typicalHighUSD.toFixed(0)}
          </span>
          <span className={isAboveRange ? "font-semibold text-bad" : "font-semibold text-good"}>
            This item: ${price.toFixed(0)}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-line/40 px-4 py-3 dark:bg-dark-line/40">
            <p className="text-xs uppercase tracking-wide text-ink/50 dark:text-ivory/50">Cost per use</p>
            <p className="mt-1 font-display text-2xl text-ink dark:text-ivory">${costPerUse.toFixed(2)}</p>
            <p className="mt-1 text-xs text-ink/50 dark:text-ivory/50">
              Based on {timesPerWeek}x/week for {weeks} weeks ({totalUses} uses)
            </p>
          </div>
          <div className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-ink/60 dark:text-ivory/60">Cheaper similar option</p>
            <p className="mt-1 font-display text-2xl text-ink dark:text-ivory">
              {comparables.cheaperAlternative.name} — ${comparables.cheaperAlternative.priceUSD.toFixed(0)}
            </p>
            <p className="mt-1 text-xs text-ink/60 dark:text-ivory/60">Similar, not identical — sample data.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg text-ink dark:text-ivory">The verdict</h2>
          {result && (
            <span className="rounded-full bg-line px-3 py-1 text-xs font-medium text-ink/60 dark:bg-dark-line dark:text-ivory/60">
              {result.source === "live" ? "AI explanation" : "Sample explanation"}
            </span>
          )}
        </div>
        {isLoading && <p className="mt-3 text-sm text-ink/60 dark:text-ivory/60">Thinking it over…</p>}
        {error && <p className="mt-3 text-sm text-bad">{error}</p>}
        {!isLoading && !error && result && (
          <p className="mt-3 text-sm text-ink/80 dark:text-ivory/80">{result.explanation}</p>
        )}
      </section>

      <LearnTip>
        Cost per use turns a big sticker price into a smaller daily number — useful, but it can also make
        overspending feel justified. Both numbers are worth looking at.
      </LearnTip>

      <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
        Made-up sample numbers for the demo. A guide, not a verdict.
      </p>
    </div>
  );
}
