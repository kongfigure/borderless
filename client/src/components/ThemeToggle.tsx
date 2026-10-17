import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/20 text-forest transition-transform hover:scale-105 dark:border-gold/30 dark:text-gold"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
