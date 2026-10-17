import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Product } from "../../shared/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "../../data/products.json");

interface ProductsFile {
  note: string;
  products: Product[];
}

export function loadProducts(): ProductsFile {
  const raw = readFileSync(dataPath, "utf-8");
  return JSON.parse(raw) as ProductsFile;
}
