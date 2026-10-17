import type { Country, CountryCode, Marketplace } from "@shared/types";

export interface DestinationHub {
  slug: string;
  city: string;
  country: Country;
  countryCode: CountryCode;
  marketplaces: Marketplace[];
  description: string;
  currency: string;
  typicalShipping: string;
  dutyNote: string;
}

/** Facts here (currency, shipping window, duty note) are presentational demo
 * copy, not derived from products.json — kept roughly in line with the
 * deliveryDays values in the sample data for each country. */
export const DESTINATIONS: DestinationHub[] = [
  {
    slug: "shanghai",
    city: "Shanghai",
    country: "China",
    countryCode: "CN",
    marketplaces: ["Taobao"],
    description: "China's marketplace capital — Taobao for everything from furniture to fast fashion.",
    currency: "CNY, shown here converted to USD",
    typicalShipping: "9–26 days to most addresses",
    dutyNote: "Demo duty assumption: flat 15% of item price",
  },
  {
    slug: "tokyo",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    marketplaces: ["Rakuten"],
    description: "Rakuten's home turf — considered homewares, quiet craftsmanship, and a growing secondhand scene.",
    currency: "JPY, shown here converted to USD",
    typicalShipping: "11–22 days to most addresses",
    dutyNote: "Demo duty assumption: flat 15% of item price",
  },
  {
    slug: "seoul",
    city: "Seoul",
    country: "South Korea",
    countryCode: "KR",
    marketplaces: ["Coupang", "Naver Shopping"],
    description: "Two marketplaces, one city — Coupang's fast fulfillment alongside Naver Shopping's broad catalog.",
    currency: "KRW, shown here converted to USD",
    typicalShipping: "9–13 days to most addresses",
    dutyNote: "Demo duty assumption: flat 15% of item price",
  },
  {
    slug: "mumbai",
    city: "Mumbai",
    country: "India",
    countryCode: "IN",
    marketplaces: ["Flipkart"],
    description: "Flipkart's reach across furniture, textiles and home goods, sourced from sellers nationwide.",
    currency: "INR, shown here converted to USD",
    typicalShipping: "10–17 days to most addresses",
    dutyNote: "Demo duty assumption: flat 15% of item price",
  },
  {
    slug: "buenos-aires",
    city: "Buenos Aires",
    country: "Argentina",
    countryCode: "AR",
    marketplaces: ["Mercado Libre"],
    description: "Mercado Libre's leather goods, knitwear and home pieces, shipped from across Argentina.",
    currency: "ARS, shown here converted to USD",
    typicalShipping: "16–24 days to most addresses",
    dutyNote: "Demo duty assumption: flat 15% of item price",
  },
  {
    slug: "vilnius",
    city: "Vilnius",
    country: "Lithuania",
    countryCode: "LT",
    marketplaces: ["Vinted"],
    description: "Vinted's secondhand and vintage racks — preloved clothing and home pieces from across the Baltics.",
    currency: "EUR, shown here converted to USD",
    typicalShipping: "10–17 days to most addresses",
    dutyNote: "Demo duty assumption: flat 15% of item price",
  },
];
