import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The site's ground is crystal white, and its neutrals are actually neutral.
 *
 * This is guarded rather than trusted because the warmth was never in one
 * place. It was in --background, in --secondary, in --border, in a
 * --gradient-cream literal that did not derive from any token, in a
 * --btn-surface literal inside a component class, in index.html's theme-color
 * and in the web manifest — seven places, of which changing the obvious one
 * would have made the site MORE yellow, not less, by removing the cream buffer
 * that was hiding the sand.
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const css = () => read("src/index.css");

/** The public token block: `:root { ... }` up to the admin theme. */
function publicTokens(): string {
  const s = css();
  const start = s.indexOf("--background:");
  const end = s.indexOf(".admin-theme");
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return s.slice(start, end);
}

describe("the public palette", () => {
  it("grounds the site on pure white", () => {
    expect(publicTokens()).toMatch(/--background:\s*0 0% 100%/);
  });

  /**
   * Every neutral surface token, checked for hue rather than by name. A warm
   * neutral is any HSL with a hue in the yellow-orange arc carrying enough
   * saturation to be seen — which is exactly what sand (34 34% 87%) was.
   */
  it("has no warm neutral left in it", () => {
    const warm: string[] = [];
    for (const [, name, h, sat] of publicTokens().matchAll(
      /--(background|secondary|muted|border|input|card|popover|accent-foreground):\s*(\d+) (\d+)%/g,
    )) {
      if (Number(h) >= 15 && Number(h) <= 70 && Number(sat) > 8) {
        warm.push(`--${name}: ${h} ${sat}%`);
      }
    }
    expect(warm).toEqual([]);
  });

  /**
   * WCAG 1.4.11. On a white page a white field's border is the only thing
   * saying where the field is, so it needs 3:1 — #949494 is 3.03:1. The old
   * warm 82% grey was about 1.4:1 and had been failing this silently.
   */
  it("gives form fields a border that meets 3:1", () => {
    const m = publicTokens().match(/--input:\s*\d+ \d+% (\d+)%/);
    expect(m).toBeTruthy();
    expect(Number(m![1])).toBeLessThanOrEqual(58);
  });

  /**
   * The literal that would have kept painting four public bands beige, and the
   * one inside .btn-shine that would have left every primary button cream.
   * Matched as DECLARATIONS — the prose above still names the old token, and
   * a test that cannot tell a comment from a rule is a test that punishes
   * writing down why something changed.
   */
  it("has no cream literal left in any declaration", () => {
    expect(css()).not.toMatch(/^\s*--gradient-cream\s*:/m);
    expect(css()).not.toMatch(/^\s*--btn-surface\s*:\s*hsl\(\s*[1-6]\d\s/m);
  });
});

describe("browser chrome", () => {
  /**
   * The address bar and the installed-app splash are painted from static files
   * that no token reaches, so they stayed beige above a white page.
   */
  it("is white in the meta tag and the manifest", () => {
    expect(read("index.html")).toMatch(/name="theme-color"\s+content="#FFFFFF"/i);
    expect(read("public/site.webmanifest")).toMatch(/"background_color":\s*"#FFFFFF"/i);
  });
});

/**
 * The section band has to be a plane you can actually see.
 *
 * At 97% lightness it measured 1.06:1 against white — so a white element on
 * it, which is what a collection tile's name plate is, was invisible, and the
 * band itself needed a hairline to register at all.
 *
 * 1.17:1 is not a number from a standard; it is where the tier actually sits.
 * Measured off the shipped CSS of eight comparable brands: Vitra #eaeaea (its
 * workhorse, used 20 times), Paola Lenti #ededed, Neptune #edede9, Aesop
 * #e9e9e9, DWR #efebe2 — a band from 1.17:1 to 1.21:1. Anything lighter is
 * decoration that costs a repaint and buys nothing.
 */
describe("the section band", () => {
  const relativeLuminance = (l: number) => {
    const c = l / 100;
    const f = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return f; // neutral grey: all three channels are equal, so this IS the luminance
  };

  it("is far enough below white for a white plate to read on it", () => {
    const match = css().match(/--secondary:\s*0 0% ([\d.]+)%/);
    expect(match, "--secondary should be a neutral grey").toBeTruthy();

    const lightness = Number(match![1]);
    const ratio = 1.05 / (relativeLuminance(lightness) + 0.05);

    expect(ratio).toBeGreaterThanOrEqual(1.15);
    // And not so dark that it stops being a light band and becomes a slab.
    expect(ratio).toBeLessThanOrEqual(1.3);
  });

  it("stays dead neutral, which is what fixed the yellow", () => {
    expect(css()).toMatch(/--secondary:\s*0 0% [\d.]+%/);
  });
});
