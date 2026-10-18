import "dotenv/config";
import express from "express";
import cors from "cors";
import { loadProducts } from "./data.js";
import { searchProducts } from "./search.js";
import { translateQuery } from "./translate.js";
import { explainVerdict } from "./explain.js";
import { scoreProduct } from "./score.js";
import { hypeCheck } from "./hype.js";
import { deinfluence } from "./deinfluence.js";
import { assistantReply, type AssistantTurn } from "./assistant.js";
import { originStory } from "./originStory.js";
import { roastOrders, type OrderHistoryItem, type Spiciness } from "./roast.js";
import { llmStatusLine } from "./llm.js";
import { submitFeedback } from "./feedback.js";

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

app.post("/api/deinfluence", async (req, res) => {
  const { itemName, priceUSD } = req.body ?? {};

  if (typeof itemName !== "string" || itemName.trim().length === 0 || itemName.length > 100) {
    res.status(400).json({ error: "itemName is required and must be a non-empty string under 100 characters" });
    return;
  }
  if (typeof priceUSD !== "number" || !Number.isFinite(priceUSD) || priceUSD <= 0) {
    res.status(400).json({ error: "priceUSD is required and must be a positive number" });
    return;
  }

  try {
    const result = await deinfluence({ itemName: itemName.trim(), priceUSD });
    res.json(result);
  } catch (err) {
    console.error("[/api/deinfluence] error:", err);
    res.status(500).json({ error: "deinfluence failed" });
  }
});

app.post("/api/assistant", async (req, res) => {
  const { message, history, context } = req.body ?? {};

  if (typeof message !== "string" || message.trim().length === 0 || message.length > 1000) {
    res.status(400).json({ error: "message is required and must be a non-empty string under 1000 characters" });
    return;
  }

  const isValidTurn = (t: unknown): t is AssistantTurn =>
    typeof t === "object" &&
    t !== null &&
    ((t as AssistantTurn).role === "user" || (t as AssistantTurn).role === "assistant") &&
    typeof (t as AssistantTurn).content === "string";

  if (!Array.isArray(history) || history.length > 10 || !history.every(isValidTurn)) {
    res.status(400).json({ error: "history must be an array of at most 10 {role, content} turns" });
    return;
  }

  if (typeof context !== "object" || context === null) {
    res.status(400).json({ error: "context is required" });
    return;
  }

  try {
    const data = loadProducts();
    const result = await assistantReply({ message: message.trim(), history, context }, data.products);
    res.json(result);
  } catch (err) {
    console.error("[/api/assistant] error:", err);
    res.status(500).json({ error: "assistant failed" });
  }
});

app.post("/api/origin-story", async (req, res) => {
  const { productName, brand, originCountry, category, fallbackStory } = req.body ?? {};

  const isNonEmptyString = (s: unknown, max: number): s is string =>
    typeof s === "string" && s.trim().length > 0 && s.length <= max;

  if (!isNonEmptyString(productName, 100)) {
    res.status(400).json({ error: "productName is required and must be a non-empty string under 100 characters" });
    return;
  }
  if (!isNonEmptyString(brand, 100)) {
    res.status(400).json({ error: "brand is required and must be a non-empty string under 100 characters" });
    return;
  }
  if (!isNonEmptyString(originCountry, 100)) {
    res.status(400).json({ error: "originCountry is required and must be a non-empty string under 100 characters" });
    return;
  }
  if (!isNonEmptyString(category, 50)) {
    res.status(400).json({ error: "category is required and must be a non-empty string under 50 characters" });
    return;
  }
  if (!isNonEmptyString(fallbackStory, 1000)) {
    res.status(400).json({ error: "fallbackStory is required and must be a non-empty string under 1000 characters" });
    return;
  }

  try {
    const result = await originStory({ productName, brand, originCountry, category, fallbackStory });
    res.json(result);
  } catch (err) {
    console.error("[/api/origin-story] error:", err);
    res.status(500).json({ error: "origin story failed" });
  }
});

app.post("/api/roast", async (req, res) => {
  const { orders, spiciness } = req.body ?? {};

  const isNonEmptyString = (s: unknown, max: number): s is string =>
    typeof s === "string" && s.trim().length > 0 && s.length <= max;
  const isFiniteNumber = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

  const isValidOrder = (o: unknown): o is OrderHistoryItem =>
    typeof o === "object" &&
    o !== null &&
    isNonEmptyString((o as OrderHistoryItem).id, 100) &&
    isNonEmptyString((o as OrderHistoryItem).itemName, 100) &&
    isFiniteNumber((o as OrderHistoryItem).priceUSD) &&
    (o as OrderHistoryItem).priceUSD > 0 &&
    isNonEmptyString((o as OrderHistoryItem).category, 50) &&
    isNonEmptyString((o as OrderHistoryItem).date, 30) &&
    isFiniteNumber((o as OrderHistoryItem).timesUsed) &&
    (o as OrderHistoryItem).timesUsed >= 0 &&
    isFiniteNumber((o as OrderHistoryItem).lastUsedDaysAgo) &&
    (o as OrderHistoryItem).lastUsedDaysAgo >= 0;

  if (!Array.isArray(orders) || orders.length === 0 || orders.length > 50 || !orders.every(isValidOrder)) {
    res.status(400).json({ error: "orders is required and must be an array of 1-50 valid order items" });
    return;
  }
  if (spiciness !== "mild" && spiciness !== "spicy") {
    res.status(400).json({ error: "spiciness must be 'mild' or 'spicy'" });
    return;
  }

  try {
    const result = await roastOrders(orders, spiciness as Spiciness);
    res.json(result);
  } catch (err) {
    console.error("[/api/roast] error:", err);
    res.status(500).json({ error: "roast failed" });
  }
});

app.post("/api/feedback", (req, res) => {
  const { message, page } = req.body ?? {};

  if (typeof message !== "string" || message.trim().length === 0 || message.length > 2000) {
    res.status(400).json({ error: "message is required and must be a non-empty string under 2000 characters" });
    return;
  }

  try {
    submitFeedback(message.trim(), typeof page === "string" ? page.slice(0, 200) : "unknown");
    res.json({ ok: true });
  } catch (err) {
    console.error("[/api/feedback] error:", err);
    res.status(500).json({ error: "feedback submission failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Borderless server listening on http://localhost:${PORT}`);
  console.log(llmStatusLine());
});
