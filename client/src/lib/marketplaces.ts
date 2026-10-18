import { siNaver, siRakuten, siTaobao, siVinted } from "simple-icons";
import type { Marketplace } from "@shared/types";

export interface MarketplaceInfo {
  /** Monogram fallback used when no brand icon is available. */
  code: string;
  color: string;
  /** Real brand icon from simple-icons, rendered in monochrome. Null when the
   * package has no icon for this store — falls back to the monogram tile. */
  brandIcon: { path: string; title: string } | null;
}

export const MARKETPLACE_INFO: Record<Marketplace, MarketplaceInfo> = {
  Taobao: { code: "T", color: "#B33A2E", brandIcon: siTaobao },
  Rakuten: { code: "R", color: "#8A2E2E", brandIcon: siRakuten },
  Coupang: { code: "C", color: "#C3A77A", brandIcon: null },
  "Naver Shopping": { code: "N", color: "#234C3B", brandIcon: siNaver },
  Flipkart: { code: "F", color: "#2F6350", brandIcon: null },
  "Mercado Libre": { code: "M", color: "#C3A77A", brandIcon: null },
  Vinted: { code: "V", color: "#234C3B", brandIcon: siVinted },
};
