import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useProductGallery } from "./useProductGallery";

/**
 * The finish picker is the one place where a photograph the owner uploaded in
 * the admin has to appear on demand. If choosing a finish leaves the previous
 * photograph on screen, the feature looks broken from the outside even though
 * every upload worked.
 */

const item = {
  cover_url: "cover.jpg",
  gallery: ["front.jpg", "side.jpg", "detail.jpg"],
};

const teak = { id: "teak", name: "טיק", swatch: "#b5834a", image_url: "teak.jpg" };
const grey = { id: "grey", name: "אפור", swatch: "#8a8a86", image_url: "grey.jpg" };

describe("useProductGallery", () => {
  it("shows the product's own gallery before any finish is chosen", () => {
    const { result } = renderHook(() => useProductGallery(item, []));
    expect(result.current.images).toEqual(["front.jpg", "side.jpg", "detail.jpg"]);
    expect(result.current.images[result.current.activeImage]).toBe("front.jpg");
  });

  it("shows the finish's photograph as soon as that finish is chosen", () => {
    const { result } = renderHook(() => useProductGallery(item, [teak, grey]));

    // The visitor has browsed to the third photo before picking a colour.
    act(() => result.current.setActiveImage(2));
    expect(result.current.images[result.current.activeImage]).toBe("detail.jpg");

    act(() => result.current.selectVariant("teak"));

    // The whole point of the click: the teak photograph, not the one that
    // happened to be on screen.
    expect(result.current.images[result.current.activeImage]).toBe("teak.jpg");
  });

  it("switches straight from one finish to another", () => {
    const { result } = renderHook(() => useProductGallery(item, [teak, grey]));
    act(() => result.current.selectVariant("teak"));
    act(() => result.current.selectVariant("grey"));
    expect(result.current.images[result.current.activeImage]).toBe("grey.jpg");
  });

  it("never leaves the main photograph blank when a finish is cleared", () => {
    const { result } = renderHook(() => useProductGallery(item, [teak, grey]));

    act(() => result.current.selectVariant("teak"));
    // Selecting adds a photo, so the last index is only valid while selected.
    act(() => result.current.setActiveImage(result.current.images.length - 1));
    act(() => result.current.selectVariant(null));

    expect(result.current.images[result.current.activeImage]).toBeDefined();
  });

  it("does not show the finish photograph twice when it is already in the gallery", () => {
    const inGallery = { cover_url: "cover.jpg", gallery: ["teak.jpg", "side.jpg"] };
    const { result } = renderHook(() => useProductGallery(inGallery, [teak]));
    act(() => result.current.selectVariant("teak"));
    expect(result.current.images).toEqual(["teak.jpg", "side.jpg"]);
  });

  it("falls back to the cover photograph when there is no gallery", () => {
    const { result } = renderHook(() => useProductGallery({ cover_url: "cover.jpg", gallery: [] }, []));
    expect(result.current.images).toEqual(["cover.jpg"]);
  });

  it("reports no images rather than crashing when the product has none", () => {
    const { result } = renderHook(() => useProductGallery({ cover_url: null, gallery: null }, []));
    expect(result.current.images).toEqual([]);
    expect(result.current.images[result.current.activeImage]).toBeUndefined();
  });

  it("reports no images while the product is still loading", () => {
    // The product page calls this before it knows whether the product exists,
    // because a hook cannot sit behind an early return.
    const { result } = renderHook(() => useProductGallery(null, []));
    expect(result.current.images).toEqual([]);
  });

  it("exposes the chosen finish so the label can name it", () => {
    const { result } = renderHook(() => useProductGallery(item, [teak, grey]));
    expect(result.current.selected).toBeNull();
    act(() => result.current.selectVariant("grey"));
    expect(result.current.selected?.name).toBe("אפור");
  });
  // Clicking a related product keeps this hook mounted: react-router reuses the
  // CollectionDetail instance across /products/a -> /products/b, so an index
  // chosen on the first product survives into the second. Land on one with
  // fewer photographs and the page rendered no main image at all — a blank grey
  // box with the thumbnail strip hidden, so nothing on screen could fix it.
  it("falls back to the first photograph when the next product has fewer", () => {
    const shorter = { cover_url: "siena-cover.jpg", gallery: [] };
    const { result, rerender } = renderHook(({ p }) => useProductGallery(p, []), {
      initialProps: { p: item as { cover_url: string | null; gallery: string[] } },
    });

    act(() => result.current.setActiveImage(2));
    expect(result.current.images[result.current.activeImage]).toBe("detail.jpg");

    rerender({ p: shorter });
    expect(result.current.activeImage).toBe(0);
    expect(result.current.images[result.current.activeImage]).toBe("siena-cover.jpg");
  });

  it("keeps the chosen photograph while the product stays put", () => {
    const { result, rerender } = renderHook(({ p }) => useProductGallery(p, []), {
      initialProps: { p: item },
    });
    act(() => result.current.setActiveImage(2));
    rerender({ p: item });
    expect(result.current.images[result.current.activeImage]).toBe("detail.jpg");
  });
});

/**
 * A colour can be saved in the admin without its own photograph — the finish
 * editor creates rows as {name, swatch, image_url: null}, and the default
 * variant is one. Choosing one of those leaves the gallery exactly as it was,
 * so resetting the index made the click look like it had thrown the visitor
 * back to the first photo for nothing.
 */
describe("a finish with no photograph of its own", () => {
  const plain = { id: "cream", name: "קרם", swatch: "#EFE9DE", image_url: null };

  it("leaves the visitor on the photograph they were looking at", () => {
    const { result } = renderHook(() => useProductGallery(item, [plain]));
    act(() => result.current.setActiveImage(2));
    act(() => result.current.selectVariant("cream"));

    expect(result.current.images[result.current.activeImage]).toBe("detail.jpg");
    expect(result.current.selected?.name).toBe("קרם");
  });

  it("still returns to the lead photograph when the finish brings one", () => {
    const { result } = renderHook(() => useProductGallery(item, [teak]));
    act(() => result.current.setActiveImage(2));
    act(() => result.current.selectVariant("teak"));
    expect(result.current.images[result.current.activeImage]).toBe("teak.jpg");
  });
});
