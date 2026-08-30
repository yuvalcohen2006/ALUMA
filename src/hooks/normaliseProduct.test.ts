import { describe, expect, it } from "vitest";
import { normaliseProduct } from "./useCollectionsData";

/**
 * The list columns are JSON in Postgres, and a row saved before those fields
 * existed — or saved by hand — comes back as null. The product page calls
 * `.length` on all four, so a null is a white screen on a real product.
 */
describe("normaliseProduct", () => {
  const bare = { id: "1", slug: "x", name: "ספה", collection_id: "c" };

  it.each(["description", "highlights", "materials", "gallery"])(
    "turns a missing %s into an empty list",
    (field) => {
      expect(normaliseProduct(bare)[field as "materials"]).toEqual([]);
    },
  );

  it.each(["description", "highlights", "materials", "gallery"])(
    "turns a null %s into an empty list",
    (field) => {
      expect(normaliseProduct({ ...bare, [field]: null })[field as "materials"]).toEqual([]);
    },
  );

  it("keeps a list that is already a list", () => {
    expect(normaliseProduct({ ...bare, materials: ["טיק", "אלומיניום"] }).materials).toEqual([
      "טיק",
      "אלומיניום",
    ]);
  });

  it("does not mistake a string for a list", () => {
    // A single-value column saved as text would otherwise be spread into
    // characters by anything that maps over it.
    expect(normaliseProduct({ ...bare, materials: "טיק" }).materials).toEqual([]);
  });

  it("leaves everything else untouched", () => {
    const p = normaliseProduct({ ...bare, name: "ספה", price: 1200, dimensions: "240" });
    expect(p.name).toBe("ספה");
    expect(p.price).toBe(1200);
    expect(p.dimensions).toBe("240");
  });
});
