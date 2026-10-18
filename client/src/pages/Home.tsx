import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Armchair,
  ArrowRight,
  Home as HomeIcon,
  Repeat,
  Search,
  Shirt,
  Sparkle,
  Sparkles,
  ThumbsDown,
  Users,
} from "lucide-react";
import type { Product } from "@shared/types";
import { landedCost, trustVerdict } from "@shared/calculations";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Flag } from "@/components/Flag";
import { DESTINATIONS } from "@/lib/destinations";
import { hasAnyPreference, loadPreferences } from "@/lib/preferences";
import { recommend } from "@/lib/recommend";

const categories = [
  { label: "Furniture", icon: Armchair },
  { label: "Home Goods", icon: HomeIcon },
  { label: "Clothing", icon: Shirt },
];

const stores = [
  { name: "Taobao", code: "T", color: "#B33A2E", country: "China" },
  { name: "Rakuten", code: "R", color: "#8A2E2E", country: "Japan" },
  { name: "Coupang", code: "C", color: "#C3A77A", country: "South Korea" },
  { name: "Naver Shopping", code: "N", color: "#234C3B", country: "South Korea" },
  { name: "Flipkart", code: "F", color: "#2F6350", country: "India" },
  { name: "Mercado Libre", code: "M", color: "#C3A77A", country: "Argentina" },
  { name: "Vinted", code: "V", color: "#234C3B", country: "Lithuania" },
];

export function Home() {
  const [query, setQuery] = useState("an oversized linen shirt");
  const [products, setProducts] = useState<Product[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts(null));
  }, []);

  const scored = useMemo(
    () =>
      products?.map((product) => ({
        ...product,
        landedCost: landedCost(product),
        verdictResult: trustVerdict(product),
      })) ?? null,
    [products]
  );

  const prefs = useMemo(() => loadPreferences(), []);
  const forYou = useMemo(
    () => (scored && hasAnyPreference(prefs) ? recommend(scored, prefs, 3) : null),
    [scored, prefs]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid grid-cols-1 overflow-hidden rounded-[2.5rem] bg-forest text-ivory lg:grid-cols-[1.3fr_1fr]"
      >
        <div className="px-6 py-14 sm:px-14 sm:py-20">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
            Everything you desire. Anywhere in the world.
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Shop the world, in English.
          </h1>
          <p className="mt-5 max-w-lg text-ivory/80">
            Find it on Taobao, Rakuten, Coupang and more. We translate it, price it to your door, and tell you if it
            looks off.
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-ivory p-2">
            <Search size={20} className="ml-3 shrink-0 text-ink/50" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="What do you want to buy?"
              className="min-w-0 flex-1 bg-transparent px-1 text-base text-ink outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory transition-transform hover:scale-[1.02]"
            >
              Search
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Speak", "Upload a photo", "Paste a link"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-ivory/40 px-4 py-2 text-sm text-ivory/90"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="relative hidden min-h-[320px] lg:block" aria-hidden="true">
          <div
            className="absolute right-[18%] top-[14%] h-40 w-32 rotate-[-6deg] rounded-2xl shadow-xl"
            style={{ background: "linear-gradient(160deg, #e8e2d4 0%, #d8c4a0 100%)" }}
          />
          <div
            className="absolute right-[32%] top-[30%] h-44 w-36 rotate-[4deg] rounded-2xl shadow-xl"
            style={{ background: "linear-gradient(160deg, #2f6350 0%, #234c3b 100%)" }}
          />
          <div
            className="absolute right-[8%] top-[42%] h-36 w-28 rotate-[10deg] rounded-2xl shadow-xl"
            style={{ background: "linear-gradient(160deg, #f7f5f0 0%, #d8c4a0 100%)" }}
          />

          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute left-[6%] top-[20%] rounded-full bg-ivory px-4 py-2 text-xs font-medium text-ink shadow-md"
          >
            Shanghai · Taobao · $34 to your door
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute bottom-[14%] right-[14%] rounded-full bg-good-soft px-4 py-1.5 text-xs font-semibold text-good shadow-md"
          >
            Looks good
          </motion.span>
        </div>
      </motion.section>

      <section className="mt-16">
        <h2 className="font-display text-2xl text-ink dark:text-ivory">Shop for</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {categories.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate("/search")}
              className="flex min-h-[160px] flex-col justify-between rounded-3xl border border-line bg-card p-7 text-left transition-transform hover:-translate-y-1 dark:border-dark-line dark:bg-dark-card"
            >
              <Icon size={36} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
              <span className="font-display text-xl text-ink dark:text-ivory">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl text-ink dark:text-ivory">Stores we search</h2>
          <span className="text-sm text-ink/50 dark:text-ivory/50">One search, every store</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {stores.map((store) => (
            <div
              key={store.name}
              className="flex items-center gap-3 rounded-full border border-line bg-card py-2 pl-2 pr-5 dark:border-dark-line dark:bg-dark-card"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full font-display text-sm text-ivory"
                style={{ backgroundColor: store.color }}
                aria-hidden="true"
              >
                {store.code}
              </span>
              <div>
                <p className="text-sm font-medium text-ink dark:text-ivory">{store.name}</p>
                <p className="text-xs text-ink/50 dark:text-ivory/50">{store.country}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={() => navigate("/deinfluence")}
          className="flex items-center justify-between gap-4 rounded-3xl border border-gold/30 bg-gold/10 px-7 py-6 text-left transition-transform hover:-translate-y-1"
        >
          <div>
            <p className="font-display text-xl text-ink dark:text-ivory">Deinfluence me</p>
            <p className="text-sm text-ink/60 dark:text-ivory/60">Talk me out of it</p>
          </div>
          <ThumbsDown size={28} strokeWidth={1.5} className="shrink-0 text-forest dark:text-gold" aria-hidden="true" />
        </button>
        <button
          onClick={() => navigate("/hype-check")}
          className="flex items-center justify-between gap-4 rounded-3xl border border-forest/20 bg-forest/5 px-7 py-6 text-left transition-transform hover:-translate-y-1 dark:border-gold/20 dark:bg-gold/5"
        >
          <div>
            <p className="font-display text-xl text-ink dark:text-ivory">Is it worth the hype?</p>
            <p className="text-sm text-ink/60 dark:text-ivory/60">Try Hype Check</p>
          </div>
          <Sparkles size={28} strokeWidth={1.5} className="shrink-0 text-forest dark:text-gold" aria-hidden="true" />
        </button>
      </section>

      <section className="mt-16">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">The world, curated</p>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl text-ink dark:text-ivory">Shop by destination</h2>
          <Link
            to="/destinations"
            className="flex items-center gap-1 text-sm font-medium text-forest hover:underline dark:text-gold"
          >
            All destinations <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {DESTINATIONS.slice(0, 3).map((hub) => (
            <Link
              key={hub.slug}
              to={`/destinations/${hub.slug}`}
              className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-6 transition-transform hover:-translate-y-1 dark:border-dark-line dark:bg-dark-card"
            >
              <div className="flex items-center gap-2">
                <Flag code={hub.countryCode} />
                <span className="text-xs text-ink/50 dark:text-ivory/50">{hub.country}</span>
              </div>
              <p className="font-display text-xl text-ink dark:text-ivory">{hub.city}</p>
              <p className="text-sm text-ink/60 dark:text-ivory/60">{hub.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-line bg-card p-7 dark:border-dark-line dark:bg-dark-card">
          <div>
            <div className="flex items-center gap-2 text-gold">
              <Repeat size={18} aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">One product, a world of possibilities</p>
            </div>
            <p className="mt-3 font-display text-xl text-ink dark:text-ivory">
              The same item, priced across every store that sells it
            </p>
            <p className="mt-2 text-sm text-ink/60 dark:text-ivory/60">
              On select product pages we line up the delivered price across marketplaces, so you can see the lowest
              total and switch stores in one tap.
            </p>
          </div>
          <Link
            to="/discover"
            className="flex items-center gap-1 text-sm font-medium text-forest hover:underline dark:text-gold"
          >
            See it in action <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-line bg-card p-7 dark:border-dark-line dark:bg-dark-card">
          <div>
            <div className="flex items-center gap-2 text-gold">
              <Users size={18} aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Better together</p>
            </div>
            <p className="mt-3 font-display text-xl text-ink dark:text-ivory">Split shipping with a group buy</p>
            <p className="mt-2 text-sm text-ink/60 dark:text-ivory/60">
              A shared shipping container costs far less per person than shipping alone — join one of our sample
              group buys to see the savings.
            </p>
          </div>
          <Link
            to="/group-buy"
            className="flex items-center gap-1 text-sm font-medium text-forest hover:underline dark:text-gold"
          >
            Browse group buys <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mt-16 flex flex-col justify-between gap-4 rounded-3xl border border-gold/30 bg-gold/10 p-7 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-gold">
            <Sparkle size={18} aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Good design deserves another life</p>
          </div>
          <p className="mt-3 font-display text-xl text-ink dark:text-ivory">Browse secondhand and vintage finds</p>
          <p className="mt-2 max-w-md text-sm text-ink/60 dark:text-ivory/60">
            Pre-loved furniture, home goods and clothing from Vinted and Rakuten, tagged with condition so you know
            what you're getting.
          </p>
        </div>
        <Link
          to="/resale"
          className="flex min-h-[44px] shrink-0 items-center justify-center gap-1 rounded-full bg-forest px-6 text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] dark:bg-gold dark:text-dark-bg"
        >
          Shop resale <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </section>

      <section className="mt-16">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Curated for the way you live</p>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl text-ink dark:text-ivory">For you</h2>
          <Link
            to="/your-taste"
            className="flex items-center gap-1 text-sm font-medium text-forest hover:underline dark:text-gold"
          >
            {forYou ? "Edit your taste" : "Set your taste"} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {forYou && forYou.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {forYou.map(({ product, reason }, i) => (
              <div key={product.id} className="flex flex-col gap-2">
                <ProductCard product={product} tileIndex={i} />
                <p className="px-1 text-xs text-ink/50 dark:text-ivory/50">{reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-start gap-3 rounded-3xl border border-line bg-card p-7 dark:border-dark-line dark:bg-dark-card">
            <p className="text-sm text-ink/70 dark:text-ivory/70">
              Set a budget, categories or a delivery deadline and we'll rank sample products against them — nothing
              is required, and nothing is shared beyond your browser.
            </p>
            <Link
              to="/your-taste"
              className="flex min-h-[44px] items-center justify-center rounded-full bg-forest px-6 text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] dark:bg-gold dark:text-dark-bg"
            >
              Set your taste
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
