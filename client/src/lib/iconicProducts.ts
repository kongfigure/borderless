export type IconicCategory = "food" | "skincare" | "home" | "clothing";

export interface IconicProduct {
  id: string;
  productName: string;
  brand: string;
  originCountry: string;
  originCountryCode: string;
  /** [longitude, latitude], for the map pin. */
  originCoordinates: [number, number];
  category: IconicCategory;
  /** 2-3 sentences, stated only as facts we're confident are accurate —
   * used as the fallback when the live origin-story call is unavailable. */
  story: string;
  shippingNote: string;
  /** Extra US import rule reminder, shown for food and skincare items. */
  extraNote?: string;
  priceUSD: number;
}

/** Common US destination point for the dashed origin-to-door line — Seattle,
 * matching the group buy tracker's delivery city elsewhere in the app. */
export const US_DESTINATION: { city: string; coordinates: [number, number] } = {
  city: "Seattle, USA",
  coordinates: [-122.3321, 47.6062],
};

export const ICONIC_PRODUCTS: IconicProduct[] = [
  {
    id: "iconic-indomie",
    productName: "Indomie Mi Goreng",
    brand: "Indofood",
    originCountry: "Indonesia",
    originCountryCode: "ID",
    originCoordinates: [106.8456, -6.2088],
    category: "food",
    story:
      "Indomie is Indonesia's best-known instant noodle brand, made by Indofood since the 1970s. Mi Goreng, its dry-fried noodle with a sweet-savory seasoning packet, is a household staple across Indonesia and one of the country's most widely exported foods.",
    shippingNote: "Ships from Indonesia, typically 10-18 days to the US depending on carrier.",
    extraNote: "Packaged food crossing into the US — check current customs food import rules before ordering.",
    priceUSD: 12.0,
  },
  {
    id: "iconic-shin-ramyun",
    productName: "Shin Ramyun",
    brand: "Nongshim",
    originCountry: "South Korea",
    originCountryCode: "KR",
    originCoordinates: [126.978, 37.5665],
    category: "food",
    story:
      "Shin Ramyun has been made by Nongshim since 1986 and is one of South Korea's most recognized instant noodle exports, known for its spicy beef broth. It remains a top seller both domestically and internationally.",
    shippingNote: "Ships from South Korea, typically 7-14 days to the US depending on carrier.",
    extraNote: "Packaged food crossing into the US — check current customs food import rules before ordering.",
    priceUSD: 15.5,
  },
  {
    id: "iconic-kewpie",
    productName: "Kewpie Mayonnaise",
    brand: "Kewpie Corporation",
    originCountry: "Japan",
    originCountryCode: "JP",
    originCoordinates: [139.6917, 35.6895],
    category: "food",
    story:
      "Kewpie has made Japanese-style mayonnaise since 1925. It's distinctive for using only egg yolks (not whole eggs) and rice or apple vinegar, giving it a richer, tangier flavor than most Western mayonnaise.",
    shippingNote: "Ships from Japan, typically 7-14 days to the US depending on carrier.",
    extraNote: "Packaged food crossing into the US — check current customs food import rules before ordering.",
    priceUSD: 9.0,
  },
  {
    id: "iconic-yerba-mate",
    productName: "Yerba Mate",
    brand: "Traditional regional producers",
    originCountry: "Argentina & Uruguay",
    originCountryCode: "AR",
    originCoordinates: [-58.3816, -34.6037],
    category: "food",
    story:
      "Yerba mate is a caffeinated herbal tea traditionally drunk from a shared gourd through a metal straw (bombilla). It's a daily social ritual across Argentina, Uruguay, and neighboring countries, where it's grown and consumed widely.",
    shippingNote: "Ships from South America, typically 12-20 days to the US depending on carrier.",
    extraNote: "Packaged food/herbal product crossing into the US — check current customs food import rules before ordering.",
    priceUSD: 14.0,
  },
  {
    id: "iconic-linen",
    productName: "Lithuanian Linen Bedding Set",
    brand: "Regional linen weavers",
    originCountry: "Lithuania",
    originCountryCode: "LT",
    originCoordinates: [25.2797, 54.6872],
    category: "home",
    story:
      "Lithuania has grown flax and woven linen for centuries, and its linen industry is well regarded across Europe for durable, breathable fabric milled from locally grown flax.",
    shippingNote: "Ships from Lithuania, typically 10-18 days to the US depending on carrier.",
    priceUSD: 89.0,
  },
  {
    id: "iconic-saree",
    productName: "Banarasi Handloom Saree",
    brand: "Varanasi handloom weavers",
    originCountry: "India",
    originCountryCode: "IN",
    originCoordinates: [83.0, 25.3176],
    category: "clothing",
    story:
      "Banarasi sarees are handwoven in Varanasi using traditional brocade techniques passed down through generations of weaving families. They're prized for intricate gold and silver zari (metallic thread) work.",
    shippingNote: "Ships from India, typically 10-20 days to the US depending on carrier.",
    priceUSD: 120.0,
  },
  {
    id: "iconic-tea-set",
    productName: "Jingdezhen Porcelain Tea Set",
    brand: "Jingdezhen potters",
    originCountry: "China",
    originCountryCode: "CN",
    originCoordinates: [117.1898, 29.2693],
    category: "home",
    story:
      "Jingdezhen has been China's center of porcelain production for over a thousand years, earning it the nickname \"Porcelain Capital.\" Its kilns historically supplied imperial courts and are still known today for fine blue-and-white ware.",
    shippingNote: "Ships from China, typically 10-20 days to the US depending on carrier.",
    priceUSD: 48.0,
  },
  {
    id: "iconic-sheet-mask",
    productName: "Korean Skincare Sheet Mask Set",
    brand: "Korean beauty brands",
    originCountry: "South Korea",
    originCountryCode: "KR",
    originCoordinates: [126.978, 37.5665],
    category: "skincare",
    story:
      "Sheet masks are a staple of the Korean skincare routine, popularized globally during the 2010s K-beauty boom. South Korea remains one of the largest exporters of affordable, fast-iterating skincare products.",
    shippingNote: "Ships from South Korea, typically 7-14 days to the US depending on carrier.",
    extraNote: "Skincare crossing into the US — check current customs cosmetics import rules before ordering.",
    priceUSD: 22.0,
  },
];
