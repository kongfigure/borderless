import { Package } from "lucide-react";
import { useParams } from "react-router-dom";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export function Product() {
  const { id } = useParams();
  return (
    <PlaceholderPage
      icon={Package}
      eyebrow={id ? `Product ${id}` : "Product"}
      title="Product detail"
      description="This will show the landed cost breakdown, trust signals, translated jargon badges, size notes, and a returns warning."
    />
  );
}
