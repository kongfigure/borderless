import { Link } from "react-router-dom";
import type { IconicProduct } from "@/lib/iconicProducts";
import { ICONIC_CATEGORY_ICON } from "@/lib/iconicCategoryIcon";
import { ICONIC_PRODUCT_IMAGES } from "@/lib/iconicProductImages";
import { Flag } from "@/components/Flag";
import { ProductPhotoTile } from "@/components/ProductPhotoTile";

export function IconicProductCard({ product }: { product: IconicProduct }) {
  const Icon = ICONIC_CATEGORY_ICON[product.category];
  const image = ICONIC_PRODUCT_IMAGES[product.id];

  return (
    <Link
      to={`/iconic/${product.id}`}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-5 transition-transform hover:-translate-y-1 dark:border-dark-line dark:bg-dark-card"
    >
      <ProductPhotoTile
        imageUrl={image?.imageUrl}
        alt={product.productName}
        icon={Icon}
        tone="bg-forest/5 dark:bg-gold/10"
        iconSize={36}
      />
      <div className="flex items-center gap-2">
        <Flag code={product.originCountryCode} />
        <span className="text-xs text-ink/50 dark:text-ivory/50">{product.originCountry}</span>
      </div>
      <p className="font-display text-lg text-ink dark:text-ivory">{product.productName}</p>
      <p className="text-xs text-ink/50 dark:text-ivory/50">{product.brand}</p>
      <p className="mt-auto text-sm text-ink/70 dark:text-ivory/70">${product.priceUSD.toFixed(2)} (sample)</p>
    </Link>
  );
}
