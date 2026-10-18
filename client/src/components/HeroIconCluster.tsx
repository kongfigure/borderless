import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CreditCard, Package, ShieldCheck, ShoppingBag, Tag, Truck } from "lucide-react";
import type { CountryCode, Marketplace } from "@shared/types";
import { Flag } from "./Flag";
import { MarketplaceMark } from "./MarketplaceMark";

interface StoreTile {
  kind: "store";
  marketplace: Marketplace;
  country: string;
  countryCode: CountryCode;
  size: number;
  top: number;
  left: number;
}

interface DecorTile {
  kind: "decor";
  icon: typeof ShoppingBag;
  label: string;
  size: number;
  top: number;
  left: number;
}

type Tile = StoreTile | DecorTile;

const STORE_TILES: StoreTile[] = [
  { kind: "store", marketplace: "Taobao", country: "China", countryCode: "CN", size: 88, top: 40.7, left: 86.7 },
  { kind: "store", marketplace: "Rakuten", country: "Japan", countryCode: "JP", size: 72, top: 71.4, left: 80.6 },
  { kind: "store", marketplace: "Coupang", country: "South Korea", countryCode: "KR", size: 64, top: 86, left: 51.4 },
  {
    kind: "store",
    marketplace: "Naver Shopping",
    country: "South Korea",
    countryCode: "KR",
    size: 80,
    top: 73.5,
    left: 21.2,
  },
  { kind: "store", marketplace: "Flipkart", country: "India", countryCode: "IN", size: 72, top: 43.3, left: 12.7 },
  {
    kind: "store",
    marketplace: "Mercado Libre",
    country: "Argentina",
    countryCode: "AR",
    size: 64,
    top: 18.2,
    left: 32.2,
  },
  { kind: "store", marketplace: "Vinted", country: "Lithuania", countryCode: "LT", size: 88, top: 17, left: 65.2 },
];

const DECOR_TILES: DecorTile[] = [
  { kind: "decor", icon: ShoppingBag, label: "Pack your bag", size: 64, top: 55.5, left: 66 },
  { kind: "decor", icon: Package, label: "Tracked packages", size: 72, top: 65.8, left: 53 },
  { kind: "decor", icon: Truck, label: "Delivered to your door", size: 64, top: 60.3, left: 37 },
  { kind: "decor", icon: ShieldCheck, label: "Buyer protection", size: 68, top: 44.5, left: 34 },
  { kind: "decor", icon: Tag, label: "Fair, transparent pricing", size: 64, top: 34.2, left: 47 },
  { kind: "decor", icon: CreditCard, label: "Secure checkout", size: 68, top: 39.7, left: 63 },
];

const TILES: Tile[] = [...STORE_TILES, ...DECOR_TILES];

const FLOAT_DURATIONS = [3.2, 3.8, 3.4, 4, 3.6, 3.0, 4.2, 3.5, 3.9, 3.3, 4.1, 3.7, 3.6];

function IconTile({ tile, index, scattered }: { tile: Tile; index: number; scattered: boolean }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const floatDuration = FLOAT_DURATIONS[index % FLOAT_DURATIONS.length];
  const floatDelay = (index % 7) * 0.15;

  const positionStyle = scattered
    ? { position: "absolute" as const, top: `${tile.top}%`, left: `${tile.left}%` }
    : {};

  return (
    <motion.div
      style={positionStyle}
      animate={reduceMotion ? undefined : { y: [0, -3, 2, 0] }}
      transition={
        reduceMotion
          ? undefined
          : { duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay: floatDelay }
      }
    >
      <div className={`group relative ${scattered ? "-translate-x-1/2 -translate-y-1/2" : ""}`}>
        {tile.kind === "store" ? (
          <motion.button
            type="button"
            onClick={() =>
              navigate(
                `/search?q=${encodeURIComponent(tile.marketplace)}&marketplace=${encodeURIComponent(tile.marketplace)}`
              )
            }
            aria-label={`Search ${tile.marketplace}, ${tile.country}`}
            whileHover={{ scale: 1.12, y: -4, zIndex: 20, boxShadow: "0 14px 28px rgba(0,0,0,0.3)" }}
            whileFocus={{ scale: 1.12, y: -4, zIndex: 20, boxShadow: "0 14px 28px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 1.08, transition: { duration: 0.15, ease: "easeOut" } }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ width: tile.size, height: tile.size }}
            className="flex items-center justify-center rounded-2xl bg-ivory/15 outline-none ring-2 ring-transparent focus-visible:ring-gold"
          >
            <MarketplaceMark marketplace={tile.marketplace} size={Math.round(tile.size * 0.5)} />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            aria-label={tile.label}
            whileHover={{ scale: 1.12, y: -4, zIndex: 20, boxShadow: "0 14px 28px rgba(0,0,0,0.3)" }}
            whileFocus={{ scale: 1.12, y: -4, zIndex: 20, boxShadow: "0 14px 28px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 1.08, transition: { duration: 0.15, ease: "easeOut" } }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ width: tile.size, height: tile.size }}
            className="flex items-center justify-center rounded-2xl bg-ivory/10 outline-none ring-2 ring-transparent focus-visible:ring-gold"
          >
            <tile.icon
              size={Math.round(tile.size * 0.42)}
              strokeWidth={1.5}
              className="text-ivory/90"
              aria-hidden="true"
            />
          </motion.button>
        )}

        {tile.kind === "store" && (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs text-ivory opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <span className="inline-flex items-center gap-1.5">
              {tile.marketplace} <Flag code={tile.countryCode} className="h-2.5 w-4 rounded-[1px]" /> {tile.country}
            </span>
          </span>
        )}
      </div>
    </motion.div>
  );
}

/** Replaces the old static hero graphic — a cluster of store and shopping
 * icons. Rendered twice: absolutely scattered on large screens (within the
 * hero's relative panel), and as an in-flow wrapped row on small screens
 * where there's no room for free-floating positioning. */
export function HeroIconCluster() {
  return (
    <>
      <div
        role="group"
        aria-label="Stores we search and shopping features"
        className="relative hidden min-h-[320px] lg:block"
      >
        {TILES.map((tile, i) => (
          <IconTile key={i} tile={tile} index={i} scattered />
        ))}
      </div>
      <div
        role="group"
        aria-label="Stores we search and shopping features"
        className="mt-8 flex flex-wrap justify-center gap-3 px-6 lg:hidden"
      >
        {TILES.map((tile, i) => (
          <IconTile key={i} tile={tile} index={i} scattered={false} />
        ))}
      </div>
    </>
  );
}
