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

export interface AssistantResponse {
  reply: string;
  source: "live" | "fallback";
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
