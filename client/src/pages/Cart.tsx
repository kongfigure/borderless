import { ShoppingBag } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export function Cart() {
  return (
    <PlaceholderPage
      icon={ShoppingBag}
      eyebrow="Pay safely"
      title="Cart & checkout"
      description="This will show the rewards optimiser across three demo cards, a mocked single-use virtual card, and a downloadable evidence file for disputes."
    />
  );
}
