import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import type { Category } from "@shared/types";
import { LearnTip } from "@/components/LearnTip";
import {
  EMPTY_PREFERENCES,
  clearPreferences,
  loadPreferences,
  savePreferences,
  type Style,
  type TastePreferences,
} from "@/lib/preferences";

const CATEGORIES: Category[] = ["Furniture", "Home Goods", "Clothing"];
const STYLES: Style[] = ["Minimal", "Bold", "Vintage", "Cozy"];

export function YourTaste() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<TastePreferences>(EMPTY_PREFERENCES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(loadPreferences());
  }, []);

  const toggleCategory = (c: Category) => {
    setPrefs((prev) => ({
      ...prev,
      categories: prev.categories.includes(c)
        ? prev.categories.filter((x) => x !== c)
        : [...prev.categories, c],
    }));
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    savePreferences(prefs);
    setSaved(true);
  };

  const handleClear = () => {
    clearPreferences();
    setPrefs(EMPTY_PREFERENCES);
    setSaved(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Optional</p>
      <h1 className="mt-3 flex items-center gap-2 font-display text-4xl text-ink dark:text-ivory">
        <Sparkles size={32} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
        Your taste
      </h1>
      <p className="mt-3 max-w-xl text-ink/70 dark:text-ivory/70">
        Tell us a little about how you shop and we'll use it to rank and filter sample products for you. Nothing
        here is required, and nothing is shared beyond your browser.
      </p>

      <form onSubmit={handleSave} className="mt-10 flex flex-col gap-8">
        <div>
          <label htmlFor="budget" className="font-display text-lg text-ink dark:text-ivory">
            Budget (delivered, USD)
          </label>
          <input
            id="budget"
            type="number"
            min={0}
            step={1}
            value={prefs.budgetUSD ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setPrefs((prev) => ({ ...prev, budgetUSD: v === "" ? null : Number(v) }));
              setSaved(false);
            }}
            placeholder="e.g. 100"
            className="mt-3 flex h-11 w-full max-w-xs rounded-full border border-line bg-card px-5 text-sm text-ink outline-none focus:border-forest dark:border-dark-line dark:bg-dark-card dark:text-ivory dark:focus:border-gold"
          />
        </div>

        <div>
          <label htmlFor="size" className="font-display text-lg text-ink dark:text-ivory">
            Clothing size
          </label>
          <input
            id="size"
            type="text"
            value={prefs.clothingSize}
            onChange={(e) => {
              setPrefs((prev) => ({ ...prev, clothingSize: e.target.value }));
              setSaved(false);
            }}
            placeholder="e.g. M, EU 40, 10"
            className="mt-3 flex h-11 w-full max-w-xs rounded-full border border-line bg-card px-5 text-sm text-ink outline-none focus:border-forest dark:border-dark-line dark:bg-dark-card dark:text-ivory dark:focus:border-gold"
          />
          <p className="mt-2 text-xs text-ink/50 dark:text-ivory/50">
            Stored for your reference only — our sample listings don't carry size data, so this never affects
            recommendations.
          </p>
        </div>

        <div>
          <p className="font-display text-lg text-ink dark:text-ivory">Preferred categories</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCategory(c)}
                aria-pressed={prefs.categories.includes(c)}
                className={`flex min-h-[44px] items-center rounded-full px-4 text-sm font-medium transition-colors ${
                  prefs.categories.includes(c)
                    ? "bg-forest text-ivory dark:bg-gold dark:text-dark-bg"
                    : "border border-line text-ink/70 hover:border-forest hover:text-forest dark:border-dark-line dark:text-ivory/70 dark:hover:border-gold dark:hover:text-gold"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-display text-lg text-ink dark:text-ivory">Style</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setPrefs((prev) => ({ ...prev, style: prev.style === s ? null : s }));
                  setSaved(false);
                }}
                aria-pressed={prefs.style === s}
                className={`flex min-h-[44px] items-center rounded-full px-4 text-sm font-medium transition-colors ${
                  prefs.style === s
                    ? "bg-ink text-ivory dark:bg-ivory dark:text-dark-bg"
                    : "border border-line text-ink/70 hover:border-ink dark:border-dark-line dark:text-ivory/70 dark:hover:border-ivory"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink/50 dark:text-ivory/50">
            Stored for your reference only — our sample listings don't carry a style tag, so this never affects
            recommendations.
          </p>
        </div>

        <div>
          <label htmlFor="deadline" className="font-display text-lg text-ink dark:text-ivory">
            Delivery deadline (days)
          </label>
          <input
            id="deadline"
            type="number"
            min={0}
            step={1}
            value={prefs.deliveryDeadlineDays ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setPrefs((prev) => ({ ...prev, deliveryDeadlineDays: v === "" ? null : Number(v) }));
              setSaved(false);
            }}
            placeholder="e.g. 14"
            className="mt-3 flex h-11 w-full max-w-xs rounded-full border border-line bg-card px-5 text-sm text-ink outline-none focus:border-forest dark:border-dark-line dark:bg-dark-card dark:text-ivory dark:focus:border-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="flex min-h-[44px] items-center justify-center rounded-full bg-forest px-6 text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] dark:bg-gold dark:text-dark-bg"
          >
            Save preferences
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex min-h-[44px] items-center justify-center rounded-full border border-line px-6 text-sm font-medium text-ink/70 hover:border-bad hover:text-bad dark:border-dark-line dark:text-ivory/70"
          >
            Clear
          </button>
          {saved && <span className="text-sm font-medium text-good">Saved to this browser.</span>}
        </div>
      </form>

      <button
        type="button"
        onClick={() => navigate("/")}
        className="mt-8 text-sm font-medium text-forest hover:underline dark:text-gold"
      >
        Back to home
      </button>

      <LearnTip>
        Budget and category and delivery preferences are structured data, so we can honestly use them to rank
        products. Size and style are shown back to you, but never used to fake a match — our sample data doesn't
        carry those fields.
      </LearnTip>
    </div>
  );
}
