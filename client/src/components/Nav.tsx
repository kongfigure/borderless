import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Globe2, Menu, ShoppingBag, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/search", label: "Search" },
  { to: "/destinations", label: "Destinations" },
  { to: "/hype", label: "Hype Check" },
  { to: "/deinfluence", label: "Deinfluence" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-forest text-ivory dark:bg-gold dark:text-dark-bg"
                : "text-ink/70 hover:bg-forest/5 hover:text-ink dark:text-ivory/70 dark:hover:bg-gold/10 dark:hover:text-ivory"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/90 backdrop-blur dark:border-dark-line dark:bg-dark-bg/90">
      <div className="mx-auto flex min-h-[72px] max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <NavLink
          to="/"
          className="flex items-center gap-2 font-display text-xl text-forest dark:text-gold"
          aria-label="Borderless home"
        >
          <Globe2 size={24} strokeWidth={1.75} aria-hidden="true" />
          Borderless
        </NavLink>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-forest text-ivory dark:bg-gold dark:text-dark-bg"
                  : "border border-forest/20 text-forest hover:bg-forest/5 dark:border-gold/30 dark:text-gold dark:hover:bg-gold/10"
              }`
            }
          >
            <ShoppingBag size={16} aria-hidden="true" />
            Cart
          </NavLink>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/20 text-forest dark:border-gold/30 dark:text-gold"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Main mobile"
          className="flex flex-col gap-1 border-t border-line px-5 py-3 lg:hidden dark:border-dark-line"
        >
          <NavLinks onNavigate={() => setOpen(false)} />
          <NavLink
            to="/cart"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-forest text-ivory dark:bg-gold dark:text-dark-bg"
                  : "text-ink/70 hover:bg-forest/5 hover:text-ink dark:text-ivory/70 dark:hover:bg-gold/10 dark:hover:text-ivory"
              }`
            }
          >
            <ShoppingBag size={16} aria-hidden="true" />
            Cart
          </NavLink>
        </nav>
      )}
    </header>
  );
}
