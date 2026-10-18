import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface ProductPhotoTileProps {
  imageUrl?: string;
  alt: string;
  icon: LucideIcon;
  tone?: string;
  iconSize?: number;
  aspect?: string;
  rounded?: string;
  children?: ReactNode;
}

/** A product photo with a neutral icon fallback (missing imageUrl, or the
 * photo fails to load), a hover zoom that respects prefers-reduced-motion,
 * and an "Illustrative photo" label — since none of these are the seller's
 * own listing photos. Overlay content (verdict badge, save button, ...) is
 * passed as children so it sits on top of the photo. */
export function ProductPhotoTile({
  imageUrl,
  alt,
  icon: Icon,
  tone = "bg-forest/10 dark:bg-gold/15",
  iconSize = 48,
  aspect = "aspect-[4/3]",
  rounded = "rounded-2xl",
  children,
}: ProductPhotoTileProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = !!imageUrl && !failed;

  return (
    <div className={`group relative w-full overflow-hidden ${aspect} ${rounded}`}>
      {showPhoto ? (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center ${tone}`}>
          <Icon size={iconSize} strokeWidth={1.5} className="text-forest dark:text-gold" aria-hidden="true" />
        </div>
      )}
      {showPhoto && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-ink/60 px-2 py-0.5 text-[10px] font-medium text-ivory backdrop-blur-sm">
          Illustrative photo
        </span>
      )}
      {children}
    </div>
  );
}
