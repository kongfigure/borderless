import { CheckCircle2, FastForward, RotateCcw, Truck } from "lucide-react";
import type { GroupBuy } from "@/lib/groupBuys";
import { ShipmentMap } from "@/components/ShipmentMap";
import { computeShipmentProgress, SHIPMENT_STAGES } from "@/lib/shipmentTracker";

const US_DESTINATION_COORDINATES: [number, number] = [-122.3321, 47.6062];
const FAST_FORWARD_DAYS = 2;

export function ShipmentTracker({
  groupBuy,
  dayIndex,
  currentParticipants,
  perPersonShippingUSD,
  onFastForward,
  onReset,
}: {
  groupBuy: GroupBuy;
  dayIndex: number;
  currentParticipants: number;
  perPersonShippingUSD: number;
  onFastForward: () => void;
  onReset: () => void;
}) {
  const progress = computeShipmentProgress(
    dayIndex,
    groupBuy.estimatedDays,
    groupBuy.originCoordinates,
    US_DESTINATION_COORDINATES,
    new Date()
  );
  const isDelivered = progress.dayIndex >= groupBuy.estimatedDays;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-6 dark:border-dark-line dark:bg-dark-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Truck size={20} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
          <h3 className="font-display text-lg text-ink dark:text-ivory">{groupBuy.title}</h3>
        </div>
        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-semibold text-ink dark:text-ivory">
          Simulated tracking. No real parcel.
        </span>
      </div>

      <ShipmentMap
        originCoordinates={groupBuy.originCoordinates}
        destinationCoordinates={US_DESTINATION_COORDINATES}
        currentPosition={progress.position}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-line/40 px-4 py-3 dark:bg-dark-line/40">
          <p className="text-xs text-ink/60 dark:text-ivory/60">ETA</p>
          <p className="mt-1 font-display text-lg text-ink dark:text-ivory">
            {isDelivered ? "Delivered" : progress.etaDate}
          </p>
        </div>
        <div className="rounded-2xl bg-line/40 px-4 py-3 dark:bg-dark-line/40">
          <p className="text-xs text-ink/60 dark:text-ivory/60">Group size</p>
          <p className="mt-1 font-display text-lg text-ink dark:text-ivory">
            {currentParticipants} of {groupBuy.targetParticipants}
          </p>
        </div>
        <div className="rounded-2xl bg-line/40 px-4 py-3 dark:bg-dark-line/40">
          <p className="text-xs text-ink/60 dark:text-ivory/60">Shipping cost</p>
          <p className="mt-1 font-display text-lg text-forest dark:text-gold">
            ${perPersonShippingUSD.toFixed(2)}
            <span className="ml-1 text-xs font-sans text-ink/50 dark:text-ivory/50 line-through">
              ${groupBuy.individualShippingUSD.toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      <ol className="flex flex-col gap-2">
        {SHIPMENT_STAGES.map((stage, i) => {
          const isDone = i < progress.currentStageIndex || (isDelivered && i <= progress.currentStageIndex);
          const isCurrent = i === progress.currentStageIndex && !isDelivered;
          return (
            <li key={stage.id} className="flex items-center gap-3 text-sm">
              <CheckCircle2
                size={18}
                strokeWidth={1.5}
                className={
                  isDone || isCurrent
                    ? "text-forest dark:text-gold"
                    : "text-ink/25 dark:text-ivory/25"
                }
                aria-hidden="true"
              />
              <span
                className={
                  isCurrent
                    ? "font-semibold text-ink dark:text-ivory"
                    : isDone
                      ? "text-ink/70 dark:text-ivory/70"
                      : "text-ink/40 dark:text-ivory/40"
                }
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onFastForward}
          disabled={isDelivered}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-full bg-forest text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] disabled:opacity-50 dark:bg-gold dark:text-dark-bg"
        >
          <FastForward size={16} aria-hidden="true" />
          Fast-forward {FAST_FORWARD_DAYS} days
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex min-h-[44px] items-center justify-center gap-1 rounded-full border border-line px-4 text-sm font-medium text-ink/70 transition-colors hover:border-forest hover:text-forest dark:border-dark-line dark:text-ivory/70 dark:hover:border-gold dark:hover:text-gold"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset
        </button>
      </div>
    </div>
  );
}

export { FAST_FORWARD_DAYS };
