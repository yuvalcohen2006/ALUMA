import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Every index on the site shows the same tile, and it behaves the same way.
 *
 * Before this there were four hover idioms across six grids — an opacity fade,
 * three different zoom factors, two easings, one of which Tailwind was
 * dropping — and the owner's word for the fade was that it "just looks like a
 * light color overlay". Fading a photograph also blends it toward whatever is
 * behind it, so the same class produced a different result per section.
 */

const ROOT = process.cwd();

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx$/.test(entry.name) && !/\.test\./.test(entry.name)) out.push(path);
  }
  return out;
}

const publicFiles = () =>
  [...sourceFiles("src/pages"), ...sourceFiles("src/components")]
    .map((f) => f.split("\\").join("/"))
    .filter((f) => !f.includes("/admin/") && !f.includes("/ui/"));

const read = (f: string) => readFileSync(join(ROOT, f), "utf8");

describe("the tile", () => {
  it("never fades a photograph on hover", () => {
    const offenders: string[] = [];
    for (const file of publicFiles()) {
      read(file)
        .split(/\r?\n/)
        .forEach((line, i) => {
          const trimmed = line.trimStart();
          if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
          // Only a fade DOWN. `group-hover:opacity-100` is the opposite move —
          // revealing something that was hidden — and is what the tile's own
          // grade and arrow use.
          if (/group-hover:opacity-(?:[1-9]\d?)\b/.test(line)) {
            offenders.push(`${file}:${i + 1}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });

  /**
   * `ul > div.reveal > li` is invalid, and it is not a pedantic point: a div
   * between the list and its items drops the list semantics that the role
   * attribute is there to restore, and it hides the li from the sibling
   * dimming rule, which selects a direct child.
   */
  it("puts the scroll-in wrapper inside the list item, not around it", () => {
    const offenders: string[] = [];
    for (const file of publicFiles()) {
      const src = read(file);
      // <Reveal ...> ... <li — with no closing </Reveal> in between.
      for (const m of src.matchAll(/<Reveal\b[^>]*>(?:(?!<\/Reveal>)[\s\S]){0,200}?<li\b/g)) {
        offenders.push(`${file}: ${src.slice(0, m.index).split("\n").length}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  /**
   * Tailwind's preflight sets list-style:none, which makes Safari and
   * VoiceOver stop announcing a <ul> as a list at all.
   */
  it("keeps list semantics on every tile grid", () => {
    const offenders: string[] = [];
    for (const file of publicFiles()) {
      const src = read(file);
      for (const m of src.matchAll(/<ul\b[^>]*>/g)) {
        if (m[0].includes("tile-grid") && !m[0].includes('role="list"')) {
          offenders.push(`${file}: ${src.slice(0, m.index).split("\n").length}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
