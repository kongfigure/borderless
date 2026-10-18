import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { formatCardNumber, type VirtualCard } from "@/lib/payment";

export function VirtualCardDisplay({
  card,
  merchantName,
  capUSD,
}: {
  card: VirtualCard;
  merchantName: string;
  capUSD: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayNumber = revealed ? formatCardNumber(card.number) : `•••• •••• •••• ${card.lastFour}`;

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(card.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest to-forest-light p-6 text-ivory shadow-lg">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm tracking-wide">Borderless Demo</span>
        <span className="rounded-full bg-ivory/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
          Sandbox
        </span>
      </div>

      <div className="mt-8 flex items-center gap-2">
        <p className="font-mono text-lg tracking-wider sm:text-xl" aria-live="polite">
          {displayNumber}
        </p>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-pressed={revealed}
          aria-label={revealed ? "Hide card number" : "Reveal card number"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ivory/15 transition-colors hover:bg-ivory/25"
        >
          {revealed ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={copyNumber}
          aria-label="Copy card number"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ivory/15 transition-colors hover:bg-ivory/25"
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between text-xs">
        <div>
          <p className="text-ivory/60">Expires</p>
          <p className="font-mono text-sm">{card.expiry}</p>
        </div>
        <div>
          <p className="text-ivory/60">CVC</p>
          <p className="font-mono text-sm">{revealed ? card.cvc : "•••"}</p>
        </div>
        <div className="text-right">
          <p className="text-ivory/60">Merchant</p>
          <p className="max-w-[9rem] truncate text-sm">{merchantName}</p>
        </div>
      </div>

      <p className="mt-5 border-t border-ivory/20 pt-3 text-xs text-ivory/70">
        Works once, capped at ${capUSD.toFixed(2)}.
      </p>
    </div>
  );
}
