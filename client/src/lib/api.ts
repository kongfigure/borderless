import type { Product } from "@shared/types";

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  const data = await res.json();
  return data.products as Product[];
}
