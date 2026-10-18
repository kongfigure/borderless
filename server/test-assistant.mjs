// Quick smoke test for the /api/assistant route's "gifts under $50" intent.
// Run against a live server: node test-assistant.mjs [baseUrl]
const baseUrl = process.argv[2] ?? "http://localhost:3001";

const body = {
  message: "gifts under $50",
  history: [],
  context: { route: "/", visibleProducts: [], cart: [], preferences: null },
};

const res = await fetch(`${baseUrl}/api/assistant`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error(`FAIL: request returned ${res.status}`);
  process.exit(1);
}

const data = await res.json();
const products = data.products ?? [];

console.log(`source: ${data.source}`);
console.log(`products: ${products.length}`);

if (products.length < 3) {
  console.error(`FAIL: expected at least 3 products, got ${products.length}`);
  process.exit(1);
}

const overBudget = products.filter((p) => p.totalUSD > 50);
if (overBudget.length > 0) {
  console.error(`FAIL: ${overBudget.length} product(s) exceed $50`, overBudget);
  process.exit(1);
}

console.log("PASS: at least 3 products, all <= $50 delivered");
