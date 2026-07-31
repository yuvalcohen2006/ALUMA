import { describe, expect, it } from "vitest";
import { createRoutesFromElements, matchRoutes, Route } from "react-router-dom";
import LangShell from "@/components/LangShell";
import { publicRoutes } from "./routes";

/**
 * The route table is mounted twice — once per language — so the thing most
 * likely to break it is an absolute path sneaking into `publicRoutes`, which
 * would make both copies resolve to the same URLs and leave /en unreachable.
 * These match the real config rather than rendering, so they stay fast.
 */
const routes = createRoutesFromElements(
  <>
    <Route path="/en" element={<LangShell lang="en" />}>
      {publicRoutes}
    </Route>
    <Route path="/" element={<LangShell lang="he" />}>
      {publicRoutes}
    </Route>
  </>
);

/** The path of the deepest route that matched, or null if nothing did. */
function matchedLeaf(pathname: string) {
  const m = matchRoutes(routes, pathname);
  if (!m) return null;
  return m[m.length - 1].route.path ?? "";
}

/** Which language shell the match sits under. */
function matchedLang(pathname: string) {
  const m = matchRoutes(routes, pathname);
  return m?.[0].route.path === "/en" ? "en" : "he";
}

describe("public route table", () => {
  it("declares every child path as relative", () => {
    // An absolute child path silently breaks the whole /en tree.
    const absolute: string[] = [];
    const walk = (rs: typeof routes) => {
      for (const r of rs) {
        if (r.children) {
          for (const c of r.children) {
            if (c.path?.startsWith("/")) absolute.push(c.path);
          }
          walk(r.children as typeof routes);
        }
      }
    };
    walk(routes);
    expect(absolute).toEqual([]);
  });

  it.each([
    "/",
    "/collections",
    "/collections/salon-monolith",
    "/materials/sunbrella",
    "/projects",
    "/blog/some-post",
    "/diy",
    "/club/dashboard",
    "/contact",
  ])("resolves %s in Hebrew", (path) => {
    expect(matchedLang(path)).toBe("he");
    expect(matchedLeaf(path)).not.toBe("*");
  });

  it.each([
    "/en",
    "/en/collections",
    "/en/collections/salon-monolith",
    "/en/materials/sunbrella",
    "/en/projects",
    "/en/blog/some-post",
    "/en/diy",
    "/en/club/dashboard",
    "/en/contact",
  ])("resolves %s in English", (path) => {
    expect(matchedLang(path)).toBe("en");
    expect(matchedLeaf(path)).not.toBe("*");
  });

  it("does not treat a path merely starting with 'en' as English", () => {
    expect(matchedLang("/enquiries")).toBe("he");
  });

  it.each(["/about", "/en/about"])("serves the renamed about page at %s", (path) => {
    expect(matchedLeaf(path)).toBe("about");
  });

  it.each(["/journal", "/en/journal"])("serves the merged journal at %s", (path) => {
    expect(matchedLeaf(path)).toBe("journal");
  });

  it("keeps the material detail pages live under their own URLs", () => {
    // Only the /materials INDEX was retired. If a redirect ever swallows
    // /materials/:slug, the journal's materials strip links to nothing.
    expect(matchedLeaf("/materials/sunbrella")).toBe("materials/:slug");
    expect(matchedLeaf("/en/materials/sunbrella")).toBe("materials/:slug");
  });

  it.each(["/materials", "/blog", "/blog/some-post"])(
    "still matches the retired %s URL so it can redirect",
    (path) => {
      expect(matchedLeaf(path)).not.toBe("*");
    }
  );

  it.each(["/story", "/en/story"])("still matches the retired %s URL", (path) => {
    // Matched, not 404: the route renders a <Navigate> to /about. Losing this
    // silently breaks every indexed link to the old page.
    expect(matchedLeaf(path)).toBe("story");
  });

  it("still falls through to the catch-all for unknown paths", () => {
    expect(matchedLeaf("/no-such-page")).toBe("*");
    expect(matchedLeaf("/en/no-such-page")).toBe("*");
  });
});
