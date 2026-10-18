import { useEffect, useState } from "react";
import { Flame, History, Snowflake, Trash2 } from "lucide-react";
import { ThumbsDown } from "lucide-react";
import { deinfluence, roastOrders, type DeinfluenceResponse, type RoastResponse } from "@/lib/api";
import { LearnTip } from "@/components/LearnTip";
import { clearOrderHistory, loadOrderHistory, type OrderHistoryItem } from "@/lib/orderHistory";

type Spiciness = "mild" | "spicy";

const EXAMPLE_CHIPS = ["Viral tumbler $45", "Cloud chair $289", "Mini blender $40", "TikTok serum $60"];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  result?: DeinfluenceResponse;
  itemName?: string;
}

const PRICE_PATTERN = /\$\s?(\d+(?:\.\d{1,2})?)/;

function parseItemAndPrice(input: string): { itemName: string; priceUSD: number } | null {
  const match = input.match(PRICE_PATTERN);
  if (!match) return null;
  const priceUSD = Number(match[1]);
  if (!Number.isFinite(priceUSD) || priceUSD <= 0) return null;
  const itemName = input.replace(match[0], "").replace(/\s{2,}/g, " ").trim() || input.trim();
  return { itemName, priceUSD };
}

function regretBarColor(score: number): string {
  if (score > 66) return "bg-bad";
  if (score > 33) return "bg-warn";
  return "bg-good";
}

export function Deinfluence() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [spiciness, setSpiciness] = useState<Spiciness>("mild");
  const [roastResult, setRoastResult] = useState<RoastResponse | null>(null);
  const [roastError, setRoastError] = useState<string | null>(null);
  const [isRoastingAll, setIsRoastingAll] = useState(false);
  const [roastingIds, setRoastingIds] = useState<Set<string>>(new Set());
  const [singleRoasts, setSingleRoasts] = useState<Record<string, string>>({});

  useEffect(() => {
    setOrders(loadOrderHistory());
  }, []);

  const roastAll = () => {
    if (orders.length === 0 || isRoastingAll) return;
    setIsRoastingAll(true);
    setRoastError(null);
    roastOrders(orders, spiciness)
      .then(setRoastResult)
      .catch((err: Error) => setRoastError(err.message || "Couldn't roast your orders right now."))
      .finally(() => setIsRoastingAll(false));
  };

  const roastOne = (order: OrderHistoryItem) => {
    if (roastingIds.has(order.id)) return;
    setRoastingIds((prev) => new Set(prev).add(order.id));
    roastOrders([order], spiciness)
      .then((result) => {
        setSingleRoasts((prev) => ({ ...prev, [order.id]: result.perOrder[order.id] }));
      })
      .catch(() => {
        setSingleRoasts((prev) => ({ ...prev, [order.id]: "Offline roast: couldn't reach the roast API for this one." }));
      })
      .finally(() => {
        setRoastingIds((prev) => {
          const next = new Set(prev);
          next.delete(order.id);
          return next;
        });
      });
  };

  const clearHistory = () => {
    clearOrderHistory();
    setOrders([]);
    setRoastResult(null);
    setSingleRoasts({});
    setRoastError(null);
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const parsed = parseItemAndPrice(trimmed);
    if (!parsed) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Add a price, like \"$45\", so I can do the cost-per-use math.",
        },
      ]);
      return;
    }

    setIsLoading(true);
    deinfluence(parsed)
      .then((result) => {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", result, itemName: parsed.itemName },
        ]);
      })
      .catch((err: Error) => {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: err.message || "Something went wrong — couldn't talk you out of (or into) this one.",
          },
        ]);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        Just for fun, and for your wallet
      </p>
      <h1 className="mt-3 flex items-center gap-2 font-display text-4xl text-ink dark:text-ivory">
        <ThumbsDown size={32} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
        Deinfluence me
      </h1>
      <p className="mt-3 max-w-xl text-ink/70 dark:text-ivory/70">
        Tell us what the internet is making you want. We'll try to talk you out of it, then show a smarter buy.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => send(chip)}
            disabled={isLoading}
            className="flex min-h-[44px] items-center rounded-full border border-line bg-card px-4 text-sm font-medium text-ink transition-colors hover:border-forest hover:text-forest disabled:opacity-50 dark:border-dark-line dark:bg-dark-card dark:text-ivory dark:hover:border-gold dark:hover:text-gold"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-sm text-ink/50 dark:text-ivory/50">
            Try a chip above, or type something like &ldquo;I want a $45 viral tumbler&rdquo;.
          </p>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-forest px-4 py-3 text-sm text-ivory dark:bg-gold dark:text-dark-bg">
              {m.text}
            </div>
          ) : (
            <div
              key={m.id}
              className="mr-auto max-w-[85%] rounded-2xl rounded-tl-sm border border-line bg-card px-4 py-3 text-sm text-ink dark:border-dark-line dark:bg-dark-card dark:text-ivory"
            >
              {m.result ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-ivory/50">
                      {m.itemName}
                    </span>
                    <span className="rounded-full bg-line px-2 py-0.5 text-[10px] font-medium text-ink/60 dark:bg-dark-line dark:text-ivory/60">
                      {m.result.source === "live" ? "AI reply" : "Sample reply"}
                    </span>
                  </div>
                  <p>{m.result.verdict}</p>
                  <p className="text-xs text-ink/50 dark:text-ivory/50">
                    ≈ ${m.result.costPerUseUSD.toFixed(2)} per use, assuming it's {m.result.usageNote} — a demo
                    assumption, not a real usage study.
                  </p>
                  <p>
                    <span className="font-semibold">Tip: </span>
                    {m.result.tip}
                  </p>
                  <p>
                    <span className="font-semibold">Instead, try: </span>
                    {m.result.alternative}
                  </p>
                  <p className="font-display text-ink/80 dark:text-ivory/80">
                    You may still buy it. Now you know why.
                  </p>
                </div>
              ) : (
                <p>{m.text}</p>
              )}
            </div>
          )
        )}

        {isLoading && (
          <div className="mr-auto rounded-2xl rounded-tl-sm border border-line bg-card px-4 py-3 text-sm text-ink/60 dark:border-dark-line dark:bg-dark-card dark:text-ivory/60">
            Thinking of a reason you don't need it…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-6 flex items-center gap-2 rounded-full border border-line bg-card p-2 dark:border-dark-line dark:bg-dark-card"
      >
        <label htmlFor="deinfluence-input" className="sr-only">
          Tell us what the internet is making you want
        </label>
        <input
          id="deinfluence-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="I want a $45 viral tumbler"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none dark:text-ivory"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex min-h-[44px] shrink-0 items-center rounded-full bg-forest px-6 text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] disabled:opacity-50 dark:bg-gold dark:text-dark-bg"
        >
          Send
        </button>
      </form>

      <LearnTip>
        Cost per use is a demo assumption about how often you'd actually use the thing — the internet is great at
        making that number feel smaller than it is.
      </LearnTip>

      <section className="mt-16">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Looking backward</p>
        <h2 className="mt-3 flex items-center gap-2 font-display text-2xl text-ink dark:text-ivory">
          <History size={24} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
          Your order history
        </h2>
        <p className="mt-2 max-w-xl text-sm text-ink/60 dark:text-ivory/60">
          Sample past orders, seeded for the demo. Every completed sandbox checkout adds a new one here.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-line bg-card p-1 dark:border-dark-line dark:bg-dark-card">
            <button
              type="button"
              onClick={() => setSpiciness("mild")}
              aria-pressed={spiciness === "mild"}
              className={`flex min-h-[36px] items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors ${
                spiciness === "mild"
                  ? "bg-forest text-ivory dark:bg-gold dark:text-dark-bg"
                  : "text-ink/60 dark:text-ivory/60"
              }`}
            >
              <Snowflake size={14} aria-hidden="true" />
              Mild
            </button>
            <button
              type="button"
              onClick={() => setSpiciness("spicy")}
              aria-pressed={spiciness === "spicy"}
              className={`flex min-h-[36px] items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors ${
                spiciness === "spicy"
                  ? "bg-forest text-ivory dark:bg-gold dark:text-dark-bg"
                  : "text-ink/60 dark:text-ivory/60"
              }`}
            >
              <Flame size={14} aria-hidden="true" />
              Spicy
            </button>
          </div>

          <button
            type="button"
            onClick={roastAll}
            disabled={orders.length === 0 || isRoastingAll}
            className="flex min-h-[44px] items-center rounded-full bg-forest px-5 text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] disabled:opacity-50 dark:bg-gold dark:text-dark-bg"
          >
            {isRoastingAll ? "Roasting…" : "Roast my orders"}
          </button>

          <button
            type="button"
            onClick={clearHistory}
            disabled={orders.length === 0}
            className="flex min-h-[44px] items-center gap-1 rounded-full border border-line px-4 text-sm font-medium text-ink/70 transition-colors hover:border-bad hover:text-bad disabled:opacity-50 dark:border-dark-line dark:text-ivory/70"
          >
            <Trash2 size={14} aria-hidden="true" />
            Clear history
          </button>
        </div>

        {roastError && (
          <p className="mt-4 rounded-2xl border border-bad/30 bg-bad-soft px-5 py-4 text-sm text-bad">{roastError}</p>
        )}

        {roastResult && (
          <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-ivory/50">
                Regret meter
              </span>
              <span className="rounded-full bg-line px-2 py-0.5 text-[10px] font-medium text-ink/60 dark:bg-dark-line dark:text-ivory/60">
                {roastResult.source === "live" ? "AI roast" : "Offline roast"}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-line dark:bg-dark-line">
              <div
                className={`h-full rounded-full ${regretBarColor(roastResult.stats.regretScore)}`}
                style={{ width: `${roastResult.stats.regretScore}%` }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-bad-soft px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-bad">Biggest regret</p>
                <p className="mt-1 text-sm text-bad">
                  {orders.find((o) => o.id === roastResult.stats.biggestRegretId)?.itemName ?? "—"}
                </p>
              </div>
              <div className="rounded-2xl bg-good-soft px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-good">Money you could have saved</p>
                <p className="mt-1 text-sm text-good">${roastResult.stats.moneyCouldHaveSavedUSD.toFixed(2)}</p>
              </div>
            </div>

            <p className="text-sm text-ink/80 dark:text-ivory/80">{roastResult.overall}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {orders.length === 0 && (
            <p className="text-sm text-ink/50 dark:text-ivory/50">
              No order history yet. Complete a sandbox checkout from the cart to add one.
            </p>
          )}

          {orders.map((order) => {
            const line = singleRoasts[order.id] ?? roastResult?.perOrder[order.id];
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-line bg-card p-4 dark:border-dark-line dark:bg-dark-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-base text-ink dark:text-ivory">{order.itemName}</p>
                    <p className="text-xs text-ink/50 dark:text-ivory/50">
                      {order.category} &middot; ${order.priceUSD.toFixed(2)} &middot; used {order.timesUsed} time
                      {order.timesUsed === 1 ? "" : "s"} &middot; {order.date}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => roastOne(order)}
                    disabled={roastingIds.has(order.id)}
                    className="flex min-h-[36px] shrink-0 items-center rounded-full border border-line px-3 text-xs font-semibold text-ink/70 transition-colors hover:border-forest hover:text-forest disabled:opacity-50 dark:border-dark-line dark:text-ivory/70 dark:hover:border-gold dark:hover:text-gold"
                  >
                    {roastingIds.has(order.id) ? "Roasting…" : "Roast this one"}
                  </button>
                </div>
                {line && <p className="mt-3 text-sm text-ink/80 dark:text-ivory/80">{line}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
        Made-up examples and rough math, for the demo. We judge the purchase, never you.
      </p>
    </div>
  );
}
