import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRoutesFromElements, matchRoutes, Route } from "react-router-dom";
import LangShell from "@/components/LangShell";
import { publicRoutes } from "./routes";

/**
 * Every quick link on the site has to land somewhere.
 *
 * A dead internal link does not throw — react-router quietly renders the
 * 404 page — so nothing catches it except a person clicking it. This walks
 * every literal link in the source and resolves it against the real route
 * table.
 */

const ROOT = process.cwd();

const routes = createRoutesFromElements(
  <>
    <Route path="/en" element={<LangShell lang="en" />}>
      {publicRoutes}
    </Route>
    <Route path="/" element={<LangShell lang="he" />}>
      {publicRoutes}
    </Route>
  </>,
);

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) out.push(path);
  }
  return out;
}

const files = sourceFiles("src").map((f) => f.split("\\").join("/"));
/** The CMS is its own tree, mounted outside the public route table. */
const publicFiles = files.filter((f) => !f.includes("/admin/") && !f.includes("AdminGuard"));

/** Every `to="/x"` / `href="/x"` / `to("/x")` literal, with where it came from. */
function internalLinks(fileList: string[]) {
  const found: { path: string; file: string }[] = [];
  for (const file of fileList) {
    const src = readFileSync(join(ROOT, file), "utf8");
    const patterns = [
      /\b(?:to|href)=\{?["'`](\/[^"'`{}\s?#]*)/g,
      /\bto\(\s*["'`](\/[^"'`{}\s?#]*)/g,
      /\bnavigate\(\s*["'`](\/[^"'`{}\s?#]*)/g,
      /<Navigate\s+to=["'`](\/[^"'`{}\s?#]*)/g,
    ];
    for (const re of patterns) {
      for (const [, path] of src.matchAll(re)) found.push({ path, file });
    }
  }
  return found;
}

/** Paths that are not react-router destinations. */
const NOT_ROUTES = [
  "/admin", // its own tree
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
  "/og-image.jpg",
];

const isRoute = (p: string) => !NOT_ROUTES.some((n) => p === n || p.startsWith(`${n}/`));

/** A path with a :param in it can't be resolved literally; give it a value. */
const concrete = (p: string) => p.replace(/:[A-Za-z]+/g, "x");

describe("internal links", () => {
  const links = internalLinks(publicFiles).filter((l) => isRoute(l.path));

  it("finds links to check", () => {
    expect(links.length).toBeGreaterThan(10);
  });

  it("all resolve to a real page", () => {
    const dead = links
      .filter(({ path }) => {
        const m = matchRoutes(routes, concrete(path));
        return !m || m[m.length - 1].route.path === "*";
      })
      .map(({ path, file }) => `${path}  ← ${file}`);
    expect([...new Set(dead)]).toEqual([]);
  });
});

describe("links that leave the site", () => {
  it("never open a new tab without rel=noopener", () => {
    // target=_blank without it hands the new page a handle on this one.
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(join(ROOT, file), "utf8");
      for (const [tag] of src.matchAll(/<a\b[\s\S]{0,600}?>/g)) {
        if (!tag.includes('target="_blank"')) continue;
        if (!/rel=["'][^"']*noopener/.test(tag) && !/rel=["'][^"']*noreferrer/.test(tag)) {
          offenders.push(`${file}: ${tag.replace(/\s+/g, " ").slice(0, 80)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("never sends a mailto: or tel: link to a new tab", () => {
    // A new tab for a mail client leaves the visitor staring at a blank tab
    // after their mail app opens — or, with a webmail handler, silently
    // hijacks them off the site.
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(join(ROOT, file), "utf8");
      for (const [tag] of src.matchAll(/<a\b[\s\S]{0,600}?>/g)) {
        const opensNewTab = tag.includes('target="_blank"');
        const isMailOrTel = /href=\{?[`"']?(mailto:|tel:)/.test(tag) || /\$\{?SITE\.email/.test(tag);
        if (opensNewTab && isMailOrTel) {
          offenders.push(`${file}: ${tag.replace(/\s+/g, " ").slice(0, 80)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
