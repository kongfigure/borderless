import "dotenv/config";
import express from "express";
import cors from "cors";
import { loadProducts } from "./data.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

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
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Borderless server listening on http://localhost:${PORT}`);
});
