import { Sparkles } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export function Hype() {
  return (
    <PlaceholderPage
      icon={Sparkles}
      eyebrow="Is it worth the hype?"
      title="Hype Check"
      description="Drop in a trending item and we'll weigh it against its usual price range, reviews and cost per use, plus suggest a cheaper similar option."
    />
  );
}
