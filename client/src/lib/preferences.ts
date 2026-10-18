import type { Category } from "@shared/types";

export type Style = "Minimal" | "Bold" | "Vintage" | "Cozy";

export interface TastePreferences {
  budgetUSD: number | null;
  clothingSize: string;
  categories: Category[];
  style: Style | null;
  deliveryDeadlineDays: number | null;
}

const STORAGE_KEY = "borderless-taste-preferences";

export const EMPTY_PREFERENCES: TastePreferences = {
  budgetUSD: null,
  clothingSize: "",
  categories: [],
  style: null,
  deliveryDeadlineDays: null,
};

export function loadPreferences(): TastePreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_PREFERENCES;
    const parsed = JSON.parse(stored);
    return { ...EMPTY_PREFERENCES, ...parsed };
  } catch {
    return EMPTY_PREFERENCES;
  }
}

export function savePreferences(prefs: TastePreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function clearPreferences(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** True only if the shopper has actually set something — an empty form is
 * never treated as a preference. */
export function hasAnyPreference(prefs: TastePreferences): boolean {
  return (
    prefs.budgetUSD !== null ||
    prefs.clothingSize.trim() !== "" ||
    prefs.categories.length > 0 ||
    prefs.style !== null ||
    prefs.deliveryDeadlineDays !== null
  );
}
