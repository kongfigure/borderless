import type { Country, CountryCode, Marketplace } from "@shared/types";

export interface GroupBuy {
  id: string;
  title: string;
  marketplace: Marketplace;
  country: Country;
  countryCode: CountryCode;
  itemPriceUSD: number;
  individualShippingUSD: number;
  targetParticipants: number;
  /** Participants already in the group, not counting the current shopper. */
  baseJoined: number;
}

/** Sample group buys. Shipping a shared container costs roughly 2.2x a
 * single parcel, not Nx — a documented demo assumption used to split the
 * cost across participants. */
export const SHARED_CONTAINER_MULTIPLIER = 2.2;

export const GROUP_BUYS: GroupBuy[] = [
  {
    id: "gb-linen-shirt",
    title: "Oversized Linen Shirt",
    marketplace: "Taobao",
    country: "China",
    countryCode: "CN",
    itemPriceUSD: 20,
    individualShippingUSD: 9,
    targetParticipants: 8,
    baseJoined: 5,
  },
  {
    id: "gb-dinnerware",
    title: "Ceramic Dinnerware Set",
    marketplace: "Rakuten",
    country: "Japan",
    countryCode: "JP",
    itemPriceUSD: 68,
    individualShippingUSD: 24,
    targetParticipants: 6,
    baseJoined: 2,
  },
  {
    id: "gb-stool",
    title: "Upcycled Oak Stool",
    marketplace: "Vinted",
    country: "Lithuania",
    countryCode: "LT",
    itemPriceUSD: 45,
    individualShippingUSD: 20,
    targetParticipants: 5,
    baseJoined: 3,
  },
];
