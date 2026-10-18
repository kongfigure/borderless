export interface CartItem {
  id: string;
  itemName: string;
  priceUSD: number;
  category: string;
}

const STORAGE_KEY = "borderless-cart";

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

export function addToCart(item: Omit<CartItem, "id">): void {
  const cart = loadCart();
  const newItem: CartItem = { ...item, id: crypto.randomUUID() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...cart, newItem]));
}

export function clearCart(): void {
  localStorage.setItem(STORAGE_KEY, "[]");
}
