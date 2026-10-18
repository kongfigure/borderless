import { Droplet, Home as HomeIcon, Shirt, UtensilsCrossed } from "lucide-react";
import type { IconicCategory } from "@/lib/iconicProducts";

export const ICONIC_CATEGORY_ICON: Record<IconicCategory, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  skincare: Droplet,
  home: HomeIcon,
  clothing: Shirt,
};
