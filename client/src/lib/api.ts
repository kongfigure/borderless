import type { Product, ScoredProduct } from "@shared/types";

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  const data = await res.json();
  return data.products as Product[];
}

export interface SearchResponse {
  chineseTerm: string;
  source: "live" | "fallback";
  steps: string[];
  results: ScoredProduct[];
}

export async function searchProducts(query: string): Promise<SearchResponse> {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Search failed: ${res.status}`);
  }
  return res.json();
}

export interface ExplainResponse {
  explanation: string;
  source: "live" | "fallback";
}

export async function explainProduct(productId: string): Promise<ExplainResponse> {
  const res = await fetch("/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Explain failed: ${res.status}`);
  }
  return res.json();
}

export interface HypeCheckRequest {
  itemName: string;
  priceUSD: number;
  typicalLowUSD: number;
  typicalHighUSD: number;
  costPerUseUSD: number;
  cheaperAlternative: { name: string; priceUSD: number };
}

export interface HypeCheckResponse {
  explanation: string;
  source: "live" | "fallback";
}

export async function hypeCheck(input: HypeCheckRequest): Promise<HypeCheckResponse> {
  const res = await fetch("/api/hype-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Hype check failed: ${res.status}`);
  }
  return res.json();
}

export interface DeinfluenceRequest {
  itemName: string;
  priceUSD: number;
}

export interface DeinfluenceResponse {
  costPerUseUSD: number;
  assumedUses: number;
  usageNote: string;
  verdict: string;
  tip: string;
  alternative: string;
  source: "live" | "fallback";
}

export async function deinfluence(input: DeinfluenceRequest): Promise<DeinfluenceResponse> {
  const res = await fetch("/api/deinfluence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Deinfluence failed: ${res.status}`);
  }
  return res.json();
}

export interface AssistantTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantVisibleProduct {
  id: string;
  title: string;
  marketplace: string;
  country: string;
  totalUSD: number;
  verdict: string;
}

export interface AssistantCartItem {
  id: string;
  title: string;
  totalUSD: number;
}

export interface AssistantPreferences {
  budgetUSD: number | null;
  categories: string[];
  deliveryDeadlineDays: number | null;
}

export interface AssistantContext {
  route: string;
  visibleProducts: AssistantVisibleProduct[];
  cart: AssistantCartItem[];
  preferences: AssistantPreferences | null;
}

export interface AssistantRequest {
  message: string;
  history: AssistantTurn[];
  context: AssistantContext;
}

export interface AssistantProductCard {
  id: string;
  title: string;
  titleTranslated?: string;
  marketplace: string;
  countryCode: string;
  category: string;
  imageUrl?: string;
  itemPriceUSD: number;
  shippingUSD: number;
  dutyUSD: number;
  estimatedTaxUSD: number;
  totalUSD: number;
  deliveryDays: number;
  fulfillment: "in_stock" | "pre_order";
  verdict: "looks_good" | "skip" | "not_enough_info";
  verdictReasons: string[];
}

export interface AssistantResponse {
  reply: string;
  source: "live" | "fallback" | "deterministic";
  products?: AssistantProductCard[];
}

export async function askAssistant(input: AssistantRequest): Promise<AssistantResponse> {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Assistant failed: ${res.status}`);
  }
  return res.json();
}

export interface OriginStoryRequest {
  productName: string;
  brand: string;
  originCountry: string;
  category: string;
  fallbackStory: string;
}

export interface OriginStoryResponse {
  story: string;
  source: "live" | "fallback";
}

export async function fetchOriginStory(input: OriginStoryRequest): Promise<OriginStoryResponse> {
  const res = await fetch("/api/origin-story", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Origin story failed: ${res.status}`);
  }
  return res.json();
}

export interface RoastOrderInput {
  id: string;
  itemName: string;
  priceUSD: number;
  category: string;
  date: string;
  timesUsed: number;
  lastUsedDaysAgo: number;
}

export interface RoastStats {
  totalSpentUSD: number;
  duplicateCategoryCount: number;
  biggestRegretId: string | null;
  moneyCouldHaveSavedUSD: number;
  regretScore: number;
}

export interface RoastResponse {
  perOrder: Record<string, string>;
  overall: string;
  stats: RoastStats;
  source: "live" | "fallback";
}

export async function roastOrders(orders: RoastOrderInput[], spiciness: "mild" | "spicy"): Promise<RoastResponse> {
  const res = await fetch("/api/roast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orders, spiciness }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Roast failed: ${res.status}`);
  }
  return res.json();
}

export async function submitFeedback(message: string, page: string): Promise<void> {
  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, page }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Feedback submission failed: ${res.status}`);
  }
}
