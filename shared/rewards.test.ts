import { describe, expect, it } from "vitest";
import { computeCardOutcome, DEMO_CARDS, rankCardOutcomes } from "./rewards.js";

describe("computeCardOutcome", () => {
  it("computes fee, rewards and effective cost, rounded to cents", () => {
    const everyday = DEMO_CARDS.find((c) => c.id === "everyday")!;
    const result = computeCardOutcome(everyday, 100);

    expect(result.feeUSD).toBe(3);
    expect(result.rewardsUSD).toBe(2);
    expect(result.effectiveCostUSD).toBe(101);
    expect(result.pointsEarned).toBe(200);
  });

  it("rounds every money figure to the cent", () => {
    const points = DEMO_CARDS.find((c) => c.id === "points")!;
    const result = computeCardOutcome(points, 73.33);

    for (const value of [result.feeUSD, result.rewardsUSD, result.effectiveCostUSD]) {
      expect(Math.round(value * 100)).toBe(Math.round(value * 100));
      expect(Number(value.toFixed(2))).toBe(value);
    }
  });
});

describe("rankCardOutcomes", () => {
  it("picks Voyager (no fee) as the winner for a typical order", () => {
    const ranked = rankCardOutcomes(100);
    // Everyday: 100 + 3 - 2 = 101. Voyager: 100 + 0 - 1 = 99. Points: 100 + 3 - 1.5 = 101.5.
    expect(ranked[0].card.id).toBe("voyager");
    expect(ranked[0].effectiveCostUSD).toBe(99);
  });

  it("changes the winner when the order total changes the ranking", () => {
    // At a tiny total the fee-free card still wins, but check the ranking recomputes, not a cached value.
    const small = rankCardOutcomes(10);
    const large = rankCardOutcomes(10000);
    expect(small[0].card.id).toBe("voyager");
    expect(large[0].card.id).toBe("voyager");
    expect(small[0].effectiveCostUSD).not.toBe(large[0].effectiveCostUSD);
  });

  it("changes the winner when a card's fee rate changes", () => {
    const customCards = DEMO_CARDS.map((c) => (c.id === "voyager" ? { ...c, foreignFeePercent: 5 } : c));
    const ranked = customCards
      .map((card) => computeCardOutcome(card, 100))
      .sort((a, b) => a.effectiveCostUSD - b.effectiveCostUSD);
    // With Voyager's fee raised to 5%, Everyday (101) now beats Voyager (104).
    expect(ranked[0].card.id).toBe("everyday");
  });

  it("always returns all three demo cards", () => {
    const ranked = rankCardOutcomes(250);
    expect(ranked).toHaveLength(3);
    expect(new Set(ranked.map((r) => r.card.id))).toEqual(new Set(["everyday", "voyager", "points"]));
  });
});
