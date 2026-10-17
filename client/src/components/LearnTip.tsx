import { Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

export function LearnTip({ children }: { children: ReactNode }) {
  return (
    <div className="mt-10 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4 text-sm text-ink/80 dark:border-gold/20 dark:bg-gold/10 dark:text-ivory/80">
      <Lightbulb size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
      <p>
        <span className="font-semibold text-ink dark:text-ivory">Learn as you shop. </span>
        {children}
      </p>
    </div>
  );
}
