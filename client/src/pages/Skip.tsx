import { ShieldAlert } from "lucide-react";
import { useParams } from "react-router-dom";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export function Skip() {
  const { id } = useParams();
  return (
    <PlaceholderPage
      icon={ShieldAlert}
      eyebrow={id ? `Why we'd skip ${id}` : "Why we'd skip this"}
      title="Why we'd skip this"
      description="This will show a price-vs-usual-range gauge and plain-language reasons, with the line: a guide from public signals, not proof."
    />
  );
}
