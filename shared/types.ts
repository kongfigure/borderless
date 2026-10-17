// Shared types for Borderless, used by both client and server.
// Sample product data lives in /data/products.json and matches this shape.

export type Marketplace =
  | "Taobao"
  | "Rakuten"
  | "Coupang"
  | "Naver Shopping"
  | "Flipkart"
  | "Mercado Libre"
  | "Vinted";

export type Country =
  | "China"
  | "Japan"
  | "South Korea"
  | "India"
  | "Argentina"
  | "Lithuania";

export type CountryCode = "CN" | "JP" | "KR" | "IN" | "AR" | "LT";

export type Category = "Furniture" | "Home Goods" | "Clothing";

/** Whether a listing ships immediately or is a pre-order. Not a judgement of
 * trust — tracked separately from the verdict. */
export type Fulfillment = "in_stock" | "pre_order";

/** A guide, not proof. "not_enough_info" is used instead of guessing. */
export type Verdict = "looks_good" | "skip" | "not_enough_info";

export interface LandedCost {
  itemPriceUSD: number;
  shippingUSD: number;
  /** Flat 15% of item price — a documented demo assumption, not a real duty rate. */
  dutyUSD: number;
  /** 8% of item + shipping + duty — a documented demo assumption, not real tax. */
  estimatedTaxUSD: number;
  totalUSD: number;
}

/** Structured, public signals only — never raw listing text. This is what any
 * LLM explanation of a verdict is allowed to read, as a defence against
 * prompt injection from listing content. */
export interface TrustSignals {
  categoryMedianPriceUSD: number;
  imageReuseCount: number;
  sellerAgeMonths: number;
  reviewCount: number;
  reviewRating: number;
  /** Free-text note for human display only — never sent to an LLM or used in scoring. */
  reviewNotes: string;
  certification: string | null;
}

export interface Product {
  id: string;
  title: string;
  /** Original-language search/listing term shown to the shopper for transparency. */
  titleTranslated?: string;
  category: Category;
  marketplace: Marketplace;
  country: Country;
  countryCode: CountryCode;
  deliveryDays: number;
  itemPriceUSD: number;
  shippingUSD: number;
  fulfillment: Fulfillment;
  trust: TrustSignals;
  /** Always true. All product data in this app is sample/demo data. */
  isSample: true;
}

export type SignalTone = "good" | "bad" | "info";

export interface TrustSignalExplanation {
  id: string;
  tone: SignalTone;
  reason: string;
}

export interface TrustVerdictResult {
  verdict: Verdict;
  signals: TrustSignalExplanation[];
}

/** A product with its landed cost and trust verdict computed. */
export interface ScoredProduct extends Product {
  landedCost: LandedCost;
  verdictResult: TrustVerdictResult;
}
