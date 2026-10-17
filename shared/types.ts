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

/** A guide, not proof. "Not enough info" is used instead of guessing. */
export type Verdict = "Looks good" | "Pre-order" | "Skip" | "Not enough info";

export interface LandedCost {
  itemPriceUSD: number;
  shippingUSD: number;
  /** Flat 15% of item price, per the build spec. */
  dutyUSD: number;
  estimatedTaxUSD: number;
  totalUSD: number;
}

/** Structured, public signals only — never raw listing text. This is what any
 * LLM explanation of a verdict is allowed to read, as a defence against
 * prompt injection from listing content. */
export interface TrustSignals {
  priceVsMedianPercent: number;
  categoryMedianPriceUSD: number;
  imageReuseCount: number;
  sellerAgeMonths: number;
  reviewCount: number;
  reviewRating: number;
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
  cost: LandedCost;
  trust: TrustSignals;
  verdict: Verdict;
  /** Always true. All product data in this app is sample/demo data. */
  isSample: true;
}
