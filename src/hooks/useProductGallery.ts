import { useCallback, useMemo, useState } from "react";

export type ProductVariant = {
  id: string;
  name: string;
  swatch: string | null;
  image_url: string | null;
};

type GalleryItem = {
  cover_url?: string | null;
  gallery?: string[] | null;
};

/**
 * The photographs on a product page, and which one is on screen.
 *
 * Choosing a finish rewrites the list — the finish's own photograph becomes
 * the lead — so the index into that list has to move with it. Leaving the
 * index where it was is what made a colour click appear to do nothing, and
 * what blanked the main photograph when a colour was cleared again.
 */
export function useProductGallery(item: GalleryItem | null, variants: ProductVariant[]) {
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const selected = variants.find((v) => v.id === activeVariant) ?? null;

  const images = useMemo(() => {
    // A chosen finish leads; the rest of the gallery still shows the piece
    // from its other angles, minus the frame the finish already supplied.
    if (selected?.image_url) {
      return [
        selected.image_url,
        ...(item?.gallery ?? []).filter((g) => g !== selected.image_url),
      ];
    }
    if (item?.gallery && item.gallery.length > 0) return item.gallery;
    return item?.cover_url ? [item.cover_url] : [];
  }, [selected?.image_url, item?.gallery, item?.cover_url]);

  const selectVariant = useCallback((id: string | null) => {
    setActiveVariant(id);
    // Back to the lead photograph, which is the finish you just chose — and,
    // when clearing, an index that is always inside the shorter list.
    setActiveImage(0);
  }, []);

  return { images, activeImage, setActiveImage, selected, activeVariant, selectVariant };
}
