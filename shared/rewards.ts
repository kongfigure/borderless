// Demo-only rewards cards for the sandbox checkout's "pick a card" optimizer.
// Rates are made up for the demo, not real card products.

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface DemoCard {
  id: string;
  name: string;
  description: string;
  /** Rewards earned as a percent of the order total. */
  rewardRatePercent: number;
  /** Foreign transaction fee as a percent of the order total. */
  foreignFeePercent: number;
}

export const DEMO_CARDS: DemoCard[] = [
  {
    id: "everyday",
    name: "Everyday",
    description: "2% back, 3% foreign transaction fee",
    rewardRatePercent: 2,
    foreignFeePercent: 3,
  },
  {
    id: "voyager",
    name: "Voyager",
    description: "1% back, no foreign transaction fee",
    rewardRatePercent: 1,
    foreignFeePercent: 0,
  },
  {
    id: "points",
    name: "Points",
    description: "1.5% points value, 3% foreign transaction fee",
    rewardRatePercent: 1.5,
    foreignFeePercent: 3,
  },
];

export interface CardOutcome {
  card: DemoCard;
  orderTotalUSD: number;
  feeUSD: number;
  rewardsUSD: number;
  effectiveCostUSD: number;
  /** Borderless points, a demo loyalty figure — 100 points per $1 of rewards earned. */
  pointsEarned: number;
}

/** Foreign fee and rewards computed on the order total, net effective cost
 * = total + fee - rewards. All figures rounded to the cent. */
export function computeCardOutcome(card: DemoCard, orderTotalUSD: number): CardOutcome {
  const feeUSD = round2(orderTotalUSD * (card.foreignFeePercent / 100));
  const rewardsUSD = round2(orderTotalUSD * (card.rewardRatePercent / 100));
  const effectiveCostUSD = round2(orderTotalUSD + feeUSD - rewardsUSD);
  const pointsEarned = Math.round(rewardsUSD * 100);

  return { card, orderTotalUSD, feeUSD, rewardsUSD, effectiveCostUSD, pointsEarned };
}

/** All demo cards' outcomes for an order, cheapest effective cost first. */
export function rankCardOutcomes(orderTotalUSD: number): CardOutcome[] {
  return DEMO_CARDS.map((card) => computeCardOutcome(card, orderTotalUSD)).sort(
    (a, b) => a.effectiveCostUSD - b.effectiveCostUSD
  );
}
