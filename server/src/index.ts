import "dotenv/config";
import express from "express";
import cors from "cors";
import { loadProducts } from "./data.js";
import { searchProducts } from "./search.js";
import { translateQuery } from "./translate.js";
import { explainVerdict } from "./explain.js";
import { scoreProduct } from "./score.js";
import { hypeCheck } from "./hype.js";

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

app.post("/api/hype-check", async (req, res) => {
  const { itemName, priceUSD, typicalLowUSD, typicalHighUSD, costPerUseUSD, cheaperAlternative } = req.body ?? {};

  const isFiniteNumber = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

  if (typeof itemName !== "string" || itemName.trim().length === 0 || itemName.length > 100) {
    res.status(400).json({ error: "itemName is required and must be a non-empty string under 100 characters" });
    return;
  }
  if (!isFiniteNumber(priceUSD) || priceUSD <= 0) {
    res.status(400).json({ error: "priceUSD is required and must be a positive number" });
    return;
  }
  if (!isFiniteNumber(typicalLowUSD) || !isFiniteNumber(typicalHighUSD) || typicalLowUSD < 0 || typicalHighUSD < typicalLowUSD) {
    res.status(400).json({ error: "typicalLowUSD and typicalHighUSD are required and must form a valid range" });
    return;
  }
  if (!isFiniteNumber(costPerUseUSD) || costPerUseUSD < 0) {
    res.status(400).json({ error: "costPerUseUSD is required and must be a non-negative number" });
    return;
  }
  if (
    typeof cheaperAlternative !== "object" ||
    cheaperAlternative === null ||
    typeof cheaperAlternative.name !== "string" ||
    cheaperAlternative.name.trim().length === 0 ||
    !isFiniteNumber(cheaperAlternative.priceUSD) ||
    cheaperAlternative.priceUSD <= 0
  ) {
    res.status(400).json({ error: "cheaperAlternative is required and must include a name and a positive priceUSD" });
    return;
  }

  try {
    const result = await hypeCheck({
      itemName,
      priceUSD,
      typicalLowUSD,
      typicalHighUSD,
      costPerUseUSD,
      cheaperAlternative: { name: cheaperAlternative.name, priceUSD: cheaperAlternative.priceUSD },
    });
    res.json(result);
  } catch (err) {
    console.error("[/api/hype-check] error:", err);
    res.status(500).json({ error: "hype check failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Borderless server listening on http://localhost:${PORT}`);
});
