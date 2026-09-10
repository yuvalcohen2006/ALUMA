import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { mergeContact } from "@/lib/site-contact";

/**
 * One phone number, in one place.
 *
 * A number pasted straight into a component answers to nothing — not the admin
 * screen, not `src/config/site.ts`. The owner changes it in /admin/settings,
 * most of the site follows, and one forgotten footer link keeps dialling the
 * old number for years. This is how that gets caught.
 */

const ROOT = process.cwd();

/** Where a literal contact fact is legitimately allowed to appear. */
const ALLOWED = [
  "src/config/site.ts", // the single source of truth
  "src/lib/site-contact.ts", // merges the admin's values over it
];

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) out.push(path);
  }
  return out;
}

/** An Israeli phone number written any of the ways people write them. */
const LITERALS = [
  /wa\.me\/\d{6,}/, // a wa.me link with the number baked in
  /tel:\+?\d[\d\s-]{7,}/, // a tel: link with the number baked in
  /\+972[\s-]?\d/, // an international number in prose or JSON-LD
  /\b0\d{1,2}-\d{3}-\d{4}\b/, // the local display form, 050-451-9062
];

describe("contact facts", () => {
  const offenders = sourceFiles("src")
    .filter((f) => !ALLOWED.includes(f.split("\\").join("/")))
    .flatMap((file) => {
      const lines = readFileSync(join(ROOT, file), "utf8").split(/\r?\n/);
      return lines
        .map((line, i) => ({ line, i }))
        // A number quoted in a comment explains history; it does not dial.
        .filter(({ line }) => !/^\s*(\/\/|\*|\/\*)/.test(line))
        .filter(({ line }) => LITERALS.some((re) => re.test(line)))
        .map(({ line, i }) => `${relative(".", file)}:${i + 1} ${line.trim()}`);
    });

  it("never hardcodes a phone number outside the config", () => {
    expect(offenders).toEqual([]);
  });
});

/**
 * A social address typed without a scheme is a RELATIVE URL, so the footer's
 * Instagram icon navigated to alumaoutdoor.com/instagram.com/aluma — an
 * internal 404 on the one link on the page whose whole job is to leave.
 */
describe("social links from the settings screen", () => {
  it("adds the scheme when the owner leaves it out", () => {
    const c = mergeContact({ instagram: "instagram.com/aluma" });
    expect(c.social.instagram).toBe("https://instagram.com/aluma");
  });

  it("leaves a full address exactly as typed", () => {
    const c = mergeContact({ facebook: "https://www.facebook.com/aluma" });
    expect(c.social.facebook).toBe("https://www.facebook.com/aluma");
  });

  it("refuses a scheme that is not the web, rather than putting it in an href", () => {
    const c = mergeContact({ instagram: "javascript:alert(1)" });
    expect(c.social.instagram).not.toContain("javascript");
  });
});
