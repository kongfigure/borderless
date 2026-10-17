import type {
  LandedCost,
  Product,
  TrustSignalExplanation,
  TrustVerdictResult,
} from "./types.js";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Item + international shipping + duty (15% of item price) + estimated tax
 * (8% of item + shipping + duty). Duty and tax rates are documented demo
 * assumptions, not real customs figures. */
export function landedCost(product: Product): LandedCost {
  const itemPriceUSD = round2(product.itemPriceUSD);
  const shippingUSD = round2(product.shippingUSD);
  const dutyUSD = round2(itemPriceUSD * 0.15);
  const estimatedTaxUSD = round2((itemPriceUSD + shippingUSD + dutyUSD) * 0.08);
  const totalUSD = round2(itemPriceUSD + shippingUSD + dutyUSD + estimatedTaxUSD);

  return { itemPriceUSD, shippingUSD, dutyUSD, estimatedTaxUSD, totalUSD };
}

const CHEAP_THRESHOLD_PERCENT = -40;
const HIGH_IMAGE_REUSE = 8;
const SOME_IMAGE_REUSE = 3;
const NEW_SELLER_MONTHS = 3;
const ESTABLISHED_SELLER_MONTHS = 12;
const MIN_REVIEWS_FOR_CONFIDENCE = 15;
const LOW_RATING_THRESHOLD = 3.8;

/** Rule-based verdict from structured signals only — price vs. category median,
 * image reuse, seller age, review volume/rating, certification. Missing
 * information (e.g. no certification, too few reviews) never counts as a
 * negative signal; it can only produce "not_enough_info". */
export function trustVerdict(product: Product): TrustVerdictResult {
  const { trust } = product;
  const priceDeltaPercent = Math.round(
    ((product.itemPriceUSD - trust.categoryMedianPriceUSD) / trust.categoryMedianPriceUSD) * 100
  );

  const isCheap = priceDeltaPercent <= CHEAP_THRESHOLD_PERCENT;
  const hasHighImageReuse = trust.imageReuseCount >= HIGH_IMAGE_REUSE;
  const hasSomeImageReuse =
    trust.imageReuseCount >= SOME_IMAGE_REUSE && trust.imageReuseCount < HIGH_IMAGE_REUSE;
  const isNewSeller = trust.sellerAgeMonths < NEW_SELLER_MONTHS;
  const isEstablishedSeller = trust.sellerAgeMonths >= ESTABLISHED_SELLER_MONTHS;
  const hasEnoughReviews = trust.reviewCount >= MIN_REVIEWS_FOR_CONFIDENCE;
  const hasLowRating = hasEnoughReviews && trust.reviewRating < LOW_RATING_THRESHOLD;

  const hardBadSignalCount = [isCheap, hasHighImageReuse, hasLowRating].filter(Boolean).length;
  const signals: TrustSignalExplanation[] = [];

  if (hardBadSignalCount >= 1) {
    if (isCheap) {
      signals.push({
        id: "price",
        tone: "bad",
        reason: `Priced ${Math.abs(priceDeltaPercent)}% below similar listings — often a sign it isn't the real material or item.`,
      });
    }
    if (hasHighImageReuse) {
      signals.push({
        id: "images",
        tone: "bad",
        reason: `The same photos appear on ${trust.imageReuseCount} other listings.`,
      });
    }
    if (hasLowRating) {
      signals.push({
        id: "rating",
        tone: "bad",
        reason: `Rated ${trust.reviewRating} out of 5 across ${trust.reviewCount} reviews.`,
      });
    }
    if (isNewSeller) {
      signals.push({
        id: "seller",
        tone: "bad",
        reason: `Seller has only been active for ${trust.sellerAgeMonths} month(s).`,
      });
    }
    return { verdict: "skip", signals };
  }

  if (!hasEnoughReviews) {
    signals.push({
      id: "reviews",
      tone: "info",
      reason: `Only ${trust.reviewCount} review(s) so far — not enough to judge quality.`,
    });
    if (isNewSeller) {
      signals.push({
        id: "seller",
        tone: "info",
        reason: `Seller has only been active for ${trust.sellerAgeMonths} month(s).`,
      });
    }
    return { verdict: "not_enough_info", signals };
  }

  if (priceDeltaPercent < 0) {
    signals.push({
      id: "price",
      tone: "good",
      reason: `Priced about ${Math.abs(priceDeltaPercent)}% below similar listings.`,
    });
  } else {
    signals.push({
      id: "price",
      tone: "good",
      reason: "Priced in line with similar listings.",
    });
  }

  if (hasSomeImageReuse) {
    signals.push({
      id: "images",
      tone: "info",
      reason: `Photos also appear on ${trust.imageReuseCount} other listing(s).`,
    });
  } else {
    signals.push({
      id: "images",
      tone: "good",
      reason: "Listing photos were not found reused elsewhere.",
    });
  }

  signals.push({
    id: "rating",
    tone: "good",
    reason: `Rated ${trust.reviewRating} out of 5 across ${trust.reviewCount} reviews.`,
  });

  if (isEstablishedSeller) {
    signals.push({
      id: "seller",
      tone: "good",
      reason: `Seller has been active for ${trust.sellerAgeMonths} months.`,
    });
  }

  if (trust.certification) {
    signals.push({
      id: "certification",
      tone: "good",
      reason: `Certified: ${trust.certification}.`,
    });
  }

  return { verdict: "looks_good", signals };
}
