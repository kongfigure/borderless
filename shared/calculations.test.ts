import { describe, expect, it } from "vitest";
import { landedCost, trustVerdict } from "./calculations.js";
import type { Product } from "./types.js";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "test-001",
    title: "Test Product",
    category: "Clothing",
    marketplace: "Taobao",
    country: "China",
    countryCode: "CN",
    deliveryDays: 10,
    itemPriceUSD: 20,
    shippingUSD: 9,
    fulfillment: "in_stock",
    trust: {
      categoryMedianPriceUSD: 31,
      imageReuseCount: 1,
      sellerAgeMonths: 42,
      reviewCount: 1280,
      reviewRating: 4.7,
      reviewNotes: "Multiple reviews say it runs true to size.",
      certification: null,
    },
    isSample: true,
    ...overrides,
  };
}

describe("landedCost", () => {
  it("computes item + shipping + 15% duty + 8% tax, rounded to cents", () => {
    const product = makeProduct({ itemPriceUSD: 20, shippingUSD: 9 });
    const result = landedCost(product);

    expect(result.itemPriceUSD).toBe(20);
    expect(result.shippingUSD).toBe(9);
    expect(result.dutyUSD).toBe(3);
    expect(result.estimatedTaxUSD).toBe(2.56);
    expect(result.totalUSD).toBe(34.56);
  });

  it("rounds every part to cents", () => {
    const product = makeProduct({ itemPriceUSD: 10.33, shippingUSD: 7.11 });
    const result = landedCost(product);

    for (const value of [result.itemPriceUSD, result.shippingUSD, result.dutyUSD, result.estimatedTaxUSD, result.totalUSD]) {
      expect(Math.round(value * 100)).toBe(value * 100);
    }
  });
});

describe("trustVerdict", () => {
  it("returns looks_good for a normal listing with healthy signals", () => {
    const product = makeProduct();
    const result = trustVerdict(product);

    expect(result.verdict).toBe("looks_good");
    expect(result.signals.length).toBeGreaterThan(0);
    expect(result.signals.some((s) => s.tone === "bad")).toBe(false);
  });

  it("returns skip for a too-cheap listing with reused photos", () => {
    const product = makeProduct({
      itemPriceUSD: 11,
      shippingUSD: 6,
      trust: {
        categoryMedianPriceUSD: 31,
        imageReuseCount: 14,
        sellerAgeMonths: 2,
        reviewCount: 9,
        reviewRating: 3.1,
        reviewNotes: "Reviews mention polyester, not linen.",
        certification: null,
      },
    });
    const result = trustVerdict(product);

    expect(result.verdict).toBe("skip");
    expect(result.signals.some((s) => s.id === "price" && s.tone === "bad")).toBe(true);
    expect(result.signals.some((s) => s.id === "images" && s.tone === "bad")).toBe(true);
    // Raw review text must never leak into the structured signal reasons.
    for (const signal of result.signals) {
      expect(signal.reason).not.toContain("polyester");
    }
  });

  it("returns not_enough_info for a listing with too few reviews and no other red flags", () => {
    const product = makeProduct({
      itemPriceUSD: 45,
      shippingUSD: 18,
      trust: {
        categoryMedianPriceUSD: 44,
        imageReuseCount: 3,
        sellerAgeMonths: 7,
        reviewCount: 9,
        reviewRating: 4.3,
        reviewNotes: "Too few reviews to confirm glaze durability.",
        certification: null,
      },
    });
    const result = trustVerdict(product);

    expect(result.verdict).toBe("not_enough_info");
    expect(result.signals.some((s) => s.tone === "bad")).toBe(false);
  });

  it("never treats a missing certification as a negative signal", () => {
    const product = makeProduct({ trust: { ...makeProduct().trust, certification: null } });
    const result = trustVerdict(product);

    expect(result.signals.some((s) => s.id === "certification" && s.tone === "bad")).toBe(false);
  });
});
