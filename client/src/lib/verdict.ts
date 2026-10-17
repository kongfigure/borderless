import type { ScoredProduct } from "@shared/types";

export type BadgeTone = "good" | "warn" | "bad" | "neutral";

export interface Badge {
  label: string;
  tone: BadgeTone;
}

/** Fulfillment is shown ahead of the trust verdict in the badge, since a
 * pre-order is a timing fact, not a risk judgement — but it's still the
 * single most useful thing to flag at a glance. */
export function getBadge(product: ScoredProduct): Badge {
  if (product.fulfillment === "pre_order") {
    return { label: "Pre-order", tone: "warn" };
  }
  switch (product.verdictResult.verdict) {
    case "looks_good":
      return { label: "Looks good", tone: "good" };
    case "skip":
      return { label: "Skip", tone: "bad" };
    case "not_enough_info":
    default:
      return { label: "Not enough info", tone: "neutral" };
  }
}

export const BADGE_STYLES: Record<BadgeTone, string> = {
  good: "bg-good-soft text-good",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  neutral: "bg-line text-ink/60 dark:bg-dark-line dark:text-ivory/60",
};
