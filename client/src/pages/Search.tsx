import { Search as SearchIcon } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export function Search() {
  return (
    <PlaceholderPage
      icon={SearchIcon}
      eyebrow="Search in English"
      title="Search results"
      description="This will show the generated Chinese search term, product cards with landed cost, and a trust verdict for each listing."
    />
  );
}
