import { describe, expect, it } from "vitest";
import { toProject } from "./useProjectsData";

/**
 * The admin's project form has a "meta description" field. It was saved and
 * never selected back, so the search-engine description the owner wrote for a
 * project never reached the page.
 */

const row = {
  slug: "villa-caesarea",
  title: "וילה בקיסריה",
  location: "קיסריה",
  category: "וילה",
  description: "מרפסת גג עם פינת ישיבה ופרגולה.",
  meta_description: "פרויקט ריהוט חוץ בקיסריה — סלון גג, פרגולה ושולחן אוכל.",
  cover_url: "cover.jpg",
  gallery: ["a.jpg", "b.jpg"],
};

describe("toProject", () => {
  it("carries the meta description the owner wrote", () => {
    expect(toProject(row).metaDescription).toBe(row.meta_description);
  });

  it("falls back to the project's own description when none was written", () => {
    // A page with no description at all is worse than a repeated one.
    expect(toProject({ ...row, meta_description: null }).metaDescription).toBe(row.description);
  });

  it("still maps the fields the page already showed", () => {
    const p = toProject(row);
    expect(p.name).toBe("וילה בקיסריה");
    expect(p.location).toBe("קיסריה");
    expect(p.tag).toBe("וילה");
    expect(p.gallery).toEqual(["a.jpg", "b.jpg"]);
  });

  it("survives a project saved with nothing but a title", () => {
    const bare = toProject({
      slug: "x",
      title: "פרויקט",
      location: null,
      category: null,
      description: null,
      meta_description: null,
      cover_url: null,
      gallery: null,
    });
    expect(bare.name).toBe("פרויקט");
    expect(bare.gallery).toEqual([]);
    expect(bare.metaDescription).toBe("");
  });
});
