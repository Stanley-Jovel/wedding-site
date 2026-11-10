import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { site } from "@/content/site";

type Props = {
  src: string | null;
  alt: string;
  // Shown on the placeholder so the couple knows which photo goes here.
  slot: string;
  hint: string;
  className?: string;
  sizes: string;
  priority?: boolean;
};

// A photo frame. With no photo yet it shows a labeled placeholder (or nothing,
// when placeholders are turned off in content/site.ts).
export function Photo({ src, alt, slot, hint, className, sizes, priority }: Props) {
  if (src) {
    return (
      <figure className={`photo ${className ?? ""}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
      </figure>
    );
  }
  if (!site.showPhotoPlaceholders) return null;
  return (
    <figure className={`photo photo-placeholder ${className ?? ""}`} aria-hidden="true">
      <div className="photo-placeholder-label">
        <ImageIcon size={28} strokeWidth={1.25} />
        <span className="photo-slot">{slot}</span>
        <span className="photo-hint">{hint}</span>
      </div>
    </figure>
  );
}
