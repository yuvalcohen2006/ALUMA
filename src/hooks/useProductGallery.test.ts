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
});
