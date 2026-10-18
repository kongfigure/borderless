import type { Marketplace } from "@shared/types";
import { MARKETPLACE_INFO } from "@/lib/marketplaces";

/** A monochrome real brand icon when simple-icons has one for the store,
 * otherwise the neutral monogram tile. Never a redrawn or invented logo. */
export function MarketplaceMark({
  marketplace,
  size = 20,
  className = "",
}: {
  marketplace: Marketplace;
  size?: number;
  className?: string;
}) {
  const info = MARKETPLACE_INFO[marketplace];

  if (info.brandIcon) {
    return (
      <span
        className={`flex items-center justify-center rounded-full bg-ink/10 text-ink dark:bg-ivory/15 dark:text-ivory ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          width={size * 0.58}
          height={size * 0.58}
          fill="currentColor"
          role="img"
          aria-label={info.brandIcon.title}
        >
          <path d={info.brandIcon.path} />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full text-[10px] font-semibold text-ivory ${className}`}
      style={{ width: size, height: size, backgroundColor: info.color }}
      aria-hidden="true"
    >
      {info.code}
    </span>
  );
}
