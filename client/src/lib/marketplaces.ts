import type { Marketplace } from "@shared/types";

export const MARKETPLACE_INFO: Record<Marketplace, { code: string; color: string }> = {
  Taobao: { code: "T", color: "#B33A2E" },
  Rakuten: { code: "R", color: "#8A2E2E" },
  Coupang: { code: "C", color: "#C3A77A" },
  "Naver Shopping": { code: "N", color: "#234C3B" },
  Flipkart: { code: "F", color: "#2F6350" },
  "Mercado Libre": { code: "M", color: "#C3A77A" },
  Vinted: { code: "V", color: "#234C3B" },
};
