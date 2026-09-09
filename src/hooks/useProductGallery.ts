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

  // Clamped, because the index outlives the product it was chosen on.
  //
  // React Router keeps one CollectionDetail mounted across /products/a ->
  // /products/b, so clicking a related piece changes `item` while this state
  // stays put. Land on a product with fewer photographs than the thumbnail you
  // last clicked and the main image was simply absent — a blank grey box on
  // the one page whose whole job is showing the furniture, with the thumbnail
  // strip hidden too, so nothing on screen could put it right.
  const safeImage = activeImage < images.length ? activeImage : 0;

  const selectVariant = useCallback(
    (id: string | null) => {
      setActiveVariant(id);
      // Back to the lead photograph, which is the finish you just chose — and,
      // when clearing, an index that is always inside the shorter list.
      //
      // But only when the finish HAS a photograph. A colour saved in the admin
      // without one leaves the gallery exactly as it was, so resetting the
      // index made the click look like it had thrown the visitor back to the
      // first photo for no reason. The clamp below keeps the index safe either
      // way, so leaving it alone is free.
      const chosen = id ? variants.find((v) => v.id === id) : null;
      if (!id || chosen?.image_url) setActiveImage(0);
    },
    [variants],
  );

  return { images, activeImage: safeImage, setActiveImage, selected, activeVariant, selectVariant };
}
