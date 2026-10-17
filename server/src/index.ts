import "dotenv/config";
import express from "express";
import cors from "cors";
import { loadProducts } from "./data.js";
import { searchProducts } from "./search.js";
import { translateQuery } from "./translate.js";
import { explainVerdict } from "./explain.js";
import { scoreProduct } from "./score.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const SEARCH_STEPS = [
  "Understanding your request",
  "Translating search terms",
  "Finding relevant products",
  "Calculating delivered costs",
  "Reviewing seller signals",
  "Preparing recommendations",
];

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", (_req, res) => {
  const data = loadProducts();
  res.json(data);
});

app.get("/api/products/:id", (req, res) => {
  const data = loadProducts();
  const product = data.products.find((p) => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(scoreProduct(product));
});

app.post("/api/search", async (req, res) => {
  const { query } = req.body ?? {};
  if (typeof query !== "string" || query.trim().length === 0) {
    res.status(400).json({ error: "query is required and must be a non-empty string" });
    return;
  }
  if (query.length > 200) {
    res.status(400).json({ error: "query is too long" });
    return;
  }

  try {
    const translation = await translateQuery(query);
    const results = searchProducts(query);
    res.json({
      chineseTerm: translation.chineseTerm,
      source: translation.source,
      steps: SEARCH_STEPS,
      results,
    });
  } catch (err) {
    console.error("[/api/search] error:", err);
    res.status(500).json({ error: "search failed" });
  }
});

app.post("/api/explain", async (req, res) => {
  const { productId } = req.body ?? {};
  if (typeof productId !== "string" || productId.trim().length === 0) {
    res.status(400).json({ error: "productId is required and must be a non-empty string" });
    return;
  }

  const data = loadProducts();
  const product = data.products.find((p) => p.id === productId);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  try {
    const scored = scoreProduct(product);
    const explanation = await explainVerdict(scored.verdictResult);
    res.json(explanation);
  } catch (err) {
    console.error("[/api/explain] error:", err);
    res.status(500).json({ error: "explain failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Borderless server listening on http://localhost:${PORT}`);
});
