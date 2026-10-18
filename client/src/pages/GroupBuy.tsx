import { useEffect, useState } from "react";
import { Truck, Users } from "lucide-react";
import { Flag } from "@/components/Flag";
import { MarketplaceMark } from "@/components/MarketplaceMark";
import { LearnTip } from "@/components/LearnTip";
import { ShipmentTracker, FAST_FORWARD_DAYS } from "@/components/ShipmentTracker";
import { GROUP_BUYS, SHARED_CONTAINER_MULTIPLIER } from "@/lib/groupBuys";

const STORAGE_KEY = "borderless-group-buy-joined";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function loadJoined(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export function GroupBuy() {
  const [joinedIds, setJoinedIds] = useState<Set<string>>(() => new Set());
  const [shipmentDays, setShipmentDays] = useState<Record<string, number>>({});

  useEffect(() => {
    setJoinedIds(loadJoined());
  }, []);

  const toggleJoin = (id: string) => {
    setJoinedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const fastForward = (id: string, totalDays: number) => {
    setShipmentDays((prev) => ({
      ...prev,
      [id]: Math.min(totalDays, (prev[id] ?? 0) + FAST_FORWARD_DAYS),
    }));
  };

  const resetShipment = (id: string) => {
    setShipmentDays((prev) => ({ ...prev, [id]: 0 }));
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Better together</p>
      <h1 className="mt-3 flex items-center gap-2 font-display text-4xl text-ink dark:text-ivory">
        <Users size={32} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
        Group Buy
      </h1>
      <p className="mt-3 max-w-xl text-ink/70 dark:text-ivory/70">
        Shipping a shared container costs far less per person than shipping alone. Join a group buy to split it.
      </p>
      <p className="mt-3 inline-flex rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-ink dark:text-ivory">
        Demo: no real orders are placed.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {GROUP_BUYS.map((gb) => {
          const isJoined = joinedIds.has(gb.id);
          const currentParticipants = gb.baseJoined + (isJoined ? 1 : 0);
          const totalGroupShippingUSD = round2(gb.individualShippingUSD * SHARED_CONTAINER_MULTIPLIER);
          const perPersonShippingUSD = round2(totalGroupShippingUSD / currentParticipants);
          const savingsUSD = round2(gb.individualShippingUSD - perPersonShippingUSD);
          const savingsPercent = Math.round((savingsUSD / gb.individualShippingUSD) * 100);
          const progress = Math.min(100, (currentParticipants / gb.targetParticipants) * 100);

          return (
            <div
              key={gb.id}
              className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card"
            >
              <div className="flex items-center gap-2">
                <Flag code={gb.countryCode} />
                <MarketplaceMark marketplace={gb.marketplace} size={24} />
                <span className="text-xs text-ink/50 dark:text-ivory/50">{gb.marketplace}</span>
              </div>

              <h2 className="font-display text-xl text-ink dark:text-ivory">{gb.title}</h2>
              <p className="text-sm text-ink/60 dark:text-ivory/60">${gb.itemPriceUSD.toFixed(2)} item price</p>

              <div>
                <div className="flex items-center justify-between text-xs text-ink/60 dark:text-ivory/60">
                  <span>
                    {currentParticipants} of {gb.targetParticipants} joined
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-line dark:bg-dark-line">
                  <div
                    className="h-2 rounded-full bg-forest dark:bg-gold"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-line/40 px-4 py-3 text-sm dark:bg-dark-line/40">
                <div className="flex justify-between">
                  <span className="text-ink/60 dark:text-ivory/60">Shipping alone</span>
                  <span className="text-ink dark:text-ivory">${gb.individualShippingUSD.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-ink/60 dark:text-ivory/60">Shipping in this group</span>
                  <span className="font-semibold text-forest dark:text-gold">${perPersonShippingUSD.toFixed(2)}</span>
                </div>
                {savingsUSD > 0 && (
                  <p className="mt-2 text-xs font-medium text-good">
                    You save ${savingsUSD.toFixed(2)} ({savingsPercent}%) on shipping
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => toggleJoin(gb.id)}
                aria-pressed={isJoined}
                className={`flex min-h-[44px] items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isJoined
                    ? "border border-forest text-forest hover:bg-forest/5 dark:border-gold dark:text-gold dark:hover:bg-gold/10"
                    : "bg-forest text-ivory hover:scale-[1.02] dark:bg-gold dark:text-dark-bg"
                }`}
              >
                {isJoined ? "Joined · Leave group" : "Join group"}
              </button>
            </div>
          );
        })}
      </div>

      <section className="mt-16">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Where your parcel is</p>
        <h2 className="mt-3 flex items-center gap-2 font-display text-2xl text-ink dark:text-ivory">
          <Truck size={24} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
          Track your shipments
        </h2>

        {GROUP_BUYS.filter((gb) => joinedIds.has(gb.id)).length === 0 ? (
          <p className="mt-4 text-sm text-ink/50 dark:text-ivory/50">
            Join a group buy above to see its simulated tracker here.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {GROUP_BUYS.filter((gb) => joinedIds.has(gb.id)).map((gb) => {
              const currentParticipants = gb.baseJoined + 1;
              const totalGroupShippingUSD = round2(gb.individualShippingUSD * SHARED_CONTAINER_MULTIPLIER);
              const perPersonShippingUSD = round2(totalGroupShippingUSD / currentParticipants);
              return (
                <ShipmentTracker
                  key={gb.id}
                  groupBuy={gb}
                  dayIndex={shipmentDays[gb.id] ?? 0}
                  currentParticipants={currentParticipants}
                  perPersonShippingUSD={perPersonShippingUSD}
                  onFastForward={() => fastForward(gb.id, gb.estimatedDays)}
                  onReset={() => resetShipment(gb.id)}
                />
              );
            })}
          </div>
        )}
      </section>

      <LearnTip>
        Group buys work because a shared shipping container scales sub-linearly with the number of parcels inside
        it — more people joining lowers everyone's per-person cost.
      </LearnTip>

      <p className="mt-10 text-xs text-ink/40 dark:text-ivory/40">
        Sample data for the demo — items, participant counts and shipping costs are made up, not real listings.
      </p>
    </div>
  );
}
