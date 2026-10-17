import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderPageProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  comingNote?: string;
}

export function PlaceholderPage({ icon: Icon, eyebrow, title, description, comingNote }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-3xl border border-line bg-card p-10 text-center dark:border-dark-line dark:bg-dark-card sm:p-16"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest dark:bg-gold/10 dark:text-gold">
          <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl text-ink dark:text-ivory sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-ink/70 dark:text-ivory/70">{description}</p>
        <p className="mt-8 text-sm text-ink/50 dark:text-ivory/50">
          {comingNote ?? "Coming in Phase 2. This screen is a placeholder for the project foundation."}
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-forest px-6 text-sm font-medium text-ivory transition-transform hover:scale-[1.02] dark:bg-gold dark:text-dark-bg"
        >
          Back home
        </Link>
      </motion.div>
    </div>
  );
}
