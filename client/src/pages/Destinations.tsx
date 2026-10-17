import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Flag } from "@/components/Flag";
import { LearnTip } from "@/components/LearnTip";
import { MARKETPLACE_INFO } from "@/lib/marketplaces";
import { DESTINATIONS } from "@/lib/destinations";

export function Destinations() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">The world, curated</p>
      <h1 className="mt-3 font-display text-4xl text-ink dark:text-ivory">Destinations</h1>
      <p className="mt-3 max-w-xl text-ink/70 dark:text-ivory/70">
        Six cities, six marketplaces. Browse sample listings sourced from each one, with delivered pricing and trust
        signals computed the same way everywhere.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.map((hub) => (
          <Link
            key={hub.slug}
            to={`/destinations/${hub.slug}`}
            className="flex flex-col justify-between gap-5 rounded-3xl border border-line bg-card p-6 transition-transform hover:-translate-y-1 dark:border-dark-line dark:bg-dark-card"
          >
            <div>
              <div className="flex items-center gap-2">
                <Flag code={hub.countryCode} />
                <span className="text-xs text-ink/50 dark:text-ivory/50">{hub.country}</span>
              </div>
              <h2 className="mt-3 font-display text-2xl text-ink dark:text-ivory">{hub.city}</h2>
              <p className="mt-2 text-sm text-ink/70 dark:text-ivory/70">{hub.description}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {hub.marketplaces.map((m) => (
                  <span
                    key={m}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card text-xs font-semibold text-ivory dark:border-dark-card"
                    style={{ backgroundColor: MARKETPLACE_INFO[m].color }}
                    aria-hidden="true"
                  >
                    {MARKETPLACE_INFO[m].code}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-forest dark:text-gold">
                Visit <ArrowRight size={16} aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <LearnTip>
        Every marketplace ships internationally, but duty and tax rules differ by country — that's why we always
        show the delivered total, not just the item price.
      </LearnTip>
    </div>
  );
}
