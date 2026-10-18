import { Armchair, Home as HomeIcon, Shirt } from "lucide-react";
import type { Category } from "@shared/types";

export const CATEGORY_ICON: Record<Category, typeof Armchair> = {
  Furniture: Armchair,
  "Home Goods": HomeIcon,
  Clothing: Shirt,
};
