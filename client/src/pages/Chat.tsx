import { MessageCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export function Chat() {
  const { id } = useParams();
  return (
    <PlaceholderPage
      icon={MessageCircle}
      eyebrow={id ? `Seller chat for ${id}` : "Seller chat"}
      title="Ask the seller"
      description="Write in English, we send it in the seller's language, and translate their reply back. Quick prompts will cover returns and material questions."
    />
  );
}
