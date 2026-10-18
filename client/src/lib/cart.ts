import type { Fulfillment, LandedCost, Verdict } from "@shared/types";

export interface CartItem {
  id: string;
  productId: string;
  itemName: string;
  /** Original-language search/listing term, carried through for the dispute evidence file. */
  titleTranslated?: string;
  category: string;
  marketplace: string;
  countryCode: string;
  imageUrl?: string;
  deliveryDays: number;
  fulfillment: Fulfillment;
  verdict: Verdict;
  verdictReasons: string[];
  quantity: number;
  /** Per single unit — multiply by quantity for a line total. */
  landedCost: LandedCost;
}

export interface CartTotals {
  itemPriceUSD: number;
  shippingUSD: number;
  dutyUSD: number;
  estimatedTaxUSD: number;
  totalUSD: number;
}

const STORAGE_KEY = "borderless-cart";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Adding the same product again increments its quantity instead of creating
 * a duplicate line, so the checkout order summary shows one row per product. */
export function addToCart(item: Omit<CartItem, "id" | "quantity">, quantity = 1): void {
  const cart = loadCart();
  const existingIndex = cart.findIndex((c) => c.productId === item.productId);

  if (existingIndex >= 0) {
    const next = [...cart];
    next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + quantity };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return;
  }

  const newItem: CartItem = { ...item, id: crypto.randomUUID(), quantity };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...cart, newItem]));
}

export function clearCart(): void {
  localStorage.setItem(STORAGE_KEY, "[]");
}

/** Sums every line's landed cost by its quantity — the same breakdown shown
 * on the cart page and the checkout order summary. */
export function cartTotals(items: CartItem[]): CartTotals {
  const totals = items.reduce(
    (sum, item) => ({
      itemPriceUSD: sum.itemPriceUSD + item.landedCost.itemPriceUSD * item.quantity,
      shippingUSD: sum.shippingUSD + item.landedCost.shippingUSD * item.quantity,
      dutyUSD: sum.dutyUSD + item.landedCost.dutyUSD * item.quantity,
      estimatedTaxUSD: sum.estimatedTaxUSD + item.landedCost.estimatedTaxUSD * item.quantity,
      totalUSD: sum.totalUSD + item.landedCost.totalUSD * item.quantity,
    }),
    { itemPriceUSD: 0, shippingUSD: 0, dutyUSD: 0, estimatedTaxUSD: 0, totalUSD: 0 }
  );

  return {
    itemPriceUSD: round2(totals.itemPriceUSD),
    shippingUSD: round2(totals.shippingUSD),
    dutyUSD: round2(totals.dutyUSD),
    estimatedTaxUSD: round2(totals.estimatedTaxUSD),
    totalUSD: round2(totals.totalUSD),
  };
}
