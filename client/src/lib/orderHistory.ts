export interface OrderHistoryItem {
  id: string;
  itemName: string;
  priceUSD: number;
  category: string;
  date: string;
  timesUsed: number;
  lastUsedDaysAgo: number;
}

const STORAGE_KEY = "borderless-order-history";

/** Fixed ids (not crypto.randomUUID()) so the seed stays stable across
 * reloads before the first localStorage write happens. */
export const SEED_ORDERS: OrderHistoryItem[] = [
  { id: "seed-1", itemName: "Viral Tumbler", priceUSD: 45, category: "Kitchenware", date: "2026-03-02", timesUsed: 6, lastUsedDaysAgo: 180 },
  { id: "seed-2", itemName: "Mini Blender 3-Pack", priceUSD: 40, category: "Kitchenware", date: "2026-01-15", timesUsed: 2, lastUsedDaysAgo: 240 },
  { id: "seed-3", itemName: "Cloud Lounge Chair", priceUSD: 289, category: "Furniture", date: "2025-11-20", timesUsed: 140, lastUsedDaysAgo: 1 },
  { id: "seed-4", itemName: "Trending Glow Serum", priceUSD: 60, category: "Skincare", date: "2026-06-10", timesUsed: 8, lastUsedDaysAgo: 90 },
  { id: "seed-5", itemName: "Phone Case", priceUSD: 25, category: "Accessories", date: "2026-08-01", timesUsed: 75, lastUsedDaysAgo: 0 },
  { id: "seed-6", itemName: "Ring Light", priceUSD: 35, category: "Electronics", date: "2026-02-14", timesUsed: 3, lastUsedDaysAgo: 220 },
];

export function loadOrderHistory(): OrderHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addOrder(order: Omit<OrderHistoryItem, "id">): OrderHistoryItem {
  const history = loadOrderHistory();
  const newOrder: OrderHistoryItem = { ...order, id: crypto.randomUUID() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...history, newOrder]));
  return newOrder;
}

/** Writes "[]" rather than removing the key, so the seed data doesn't
 * reappear the next time loadOrderHistory() runs. */
export function clearOrderHistory(): void {
  localStorage.setItem(STORAGE_KEY, "[]");
}
