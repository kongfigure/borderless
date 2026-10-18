import type { Fulfillment, LandedCost, Verdict } from "@shared/types";
import type { CartItem } from "./cart";

export interface OrderDeliveryDetails {
  name: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  deadline?: string;
}

export interface OrderLineItem {
  productId: string;
  itemName: string;
  titleTranslated?: string;
  category: string;
  marketplace: string;
  countryCode: string;
  imageUrl?: string;
  quantity: number;
  deliveryDays: number;
  fulfillment: Fulfillment;
  verdict: Verdict;
  verdictReasons: string[];
  /** Per single unit. */
  landedCost: LandedCost;
  /** ISO date — today + deliveryDays, a promise not a guarantee. */
  promisedDeliveryDate: string;
}

export interface Order {
  id: string;
  createdAt: string;
  isSandbox: true;
  delivery: OrderDeliveryDetails;
  items: OrderLineItem[];
  totals: { itemPriceUSD: number; shippingUSD: number; dutyUSD: number; estimatedTaxUSD: number; totalUSD: number };
  rewardsCard: { id: string; name: string; feeUSD: number; rewardsUSD: number; effectiveCostUSD: number };
  pointsEarned: number;
  moneySavedVsWorstCardUSD: number;
  cardLastFour: string;
}

const STORAGE_KEY = "borderless-orders";
const ORDER_ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderId(): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += ORDER_ID_CHARS[Math.floor(Math.random() * ORDER_ID_CHARS.length)];
  }
  return `BL-${suffix}`;
}

export function promisedDeliveryDate(deliveryDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + deliveryDays);
  return date.toISOString().slice(0, 10);
}

export function buildOrderLineItems(items: CartItem[]): OrderLineItem[] {
  return items.map((item) => ({
    productId: item.productId,
    itemName: item.itemName,
    titleTranslated: item.titleTranslated,
    category: item.category,
    marketplace: item.marketplace,
    countryCode: item.countryCode,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    deliveryDays: item.deliveryDays,
    fulfillment: item.fulfillment,
    verdict: item.verdict,
    verdictReasons: item.verdictReasons,
    landedCost: item.landedCost,
    promisedDeliveryDate: promisedDeliveryDate(item.deliveryDays),
  }));
}

export function loadOrders(): Order[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Order): void {
  const orders = loadOrders();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...orders, order]));
}

export function getOrder(id: string): Order | null {
  return loadOrders().find((o) => o.id === id) ?? null;
}

/** The "evidence file" for a dispute: search terms, price breakdown, trust
 * verdict and reasons, promised delivery date, and the card used — enough to
 * back a chargeback, deliberately never the full card number. */
export function buildEvidenceFile(order: Order) {
  return {
    orderId: order.id,
    timestamp: order.createdAt,
    isSandboxOrder: true,
    note: "Keep this if you need to dispute a charge. Sample data from a hackathon demo.",
    delivery: order.delivery,
    items: order.items.map((item) => ({
      itemName: item.itemName,
      searchQuery: item.itemName,
      translatedSearchTerm: item.titleTranslated ?? null,
      marketplace: item.marketplace,
      quantity: item.quantity,
      priceBreakdownUSD: item.landedCost,
      trustVerdict: item.verdict,
      trustReasons: item.verdictReasons,
      sellerChatTranscript: [],
      promisedDeliveryDate: item.promisedDeliveryDate,
    })),
    totalsUSD: order.totals,
    cardUsedLastFour: order.cardLastFour,
    rewardsCard: order.rewardsCard.name,
  };
}

export function downloadEvidenceFile(order: Order): void {
  const content = JSON.stringify(buildEvidenceFile(order), null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `borderless-evidence-${order.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
