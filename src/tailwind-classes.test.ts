import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Class names that read like CSS logical properties but are not Tailwind
 * utilities. They compile to nothing at all — no warning, no error, no style —
 * so the element quietly falls back to `auto` and lands wherever the layout
 * puts it. An absolutely positioned element with no inset is the worst case:
 * it looks almost right until it doesn't.
 *
 * Tailwind's actual names are the short ones: start-0 / end-0 for the inline
 * axis, inset-y-* for the block axis, ms-/me-/ps-/pe- for margin and padding.
 */

const ROOT = process.cwd();

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) out.push(path);
  }
  return out;
}

/** CSS property names used where a Tailwind utility was meant. */
const NOT_UTILITIES = [
  "inset-inline-start-",
  "inset-inline-end-",
  "inset-inline-",
  "inset-block-",
  "margin-inline-",
  "padding-inline-",
  "border-inline-",
];

describe("Tailwind class names", () => {
  it("never uses a CSS property name as a utility", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles("src")) {
      readFileSync(join(ROOT, file), "utf8")
        .split(/\r?\n/)
        .forEach((line, i) => {
          // Class strings often sit on their own continuation line inside a
          // template literal, so scan every line — but a comment explaining
          // the CSS, and a `style` object using the real property, are fine.
          const trimmed = line.trimStart();
          if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
          if (/style=|insetInline|insetBlock/.test(line)) return;
          for (const bad of NOT_UTILITIES) {
            if (line.includes(bad)) offenders.push(`${file}:${i + 1} ${bad}`);
          }
        });
    }
    expect([...new Set(offenders)]).toEqual([]);
  });
});

/**
 * Physical direction utilities on a page that renders in both directions.
 *
 * `pr-6` is the right edge whichever way the page reads, so a bulleted list
 * that looks right in Hebrew has its padding on the wrong side under /en, and
 * the markers sit outside the text. The logical pair (ps-/pe-, ms-/me-,
 * start-/end-, text-start/text-end) follows the reader.
 *
 * The admin is exempt: it is Hebrew-only by design and never renders LTR.
 */
describe("direction-aware spacing", () => {
  const publicFiles = sourceFiles("src").filter(
    (f) => !f.includes("admin") && !f.includes("/ui/"),
  );

  it("uses logical properties on every page that has an English twin", () => {
    const offenders: string[] = [];
    for (const file of publicFiles) {
      readFileSync(join(ROOT, file), "utf8")
        .split(/\r?\n/)
        .forEach((line, i) => {
          const trimmed = line.trimStart();
          if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
          // rtl:/ltr: variants are deliberate — they name the direction they
          // apply to, which is the whole point of using them.
          const stripped = line.replace(/\b(rtl|ltr):[\w[\]./-]+/g, "");
          if (/\bclassName=/.test(line) || /^\s*["'`]/.test(trimmed)) {
            if (/\b(ml-|mr-|pl-|pr-)\d/.test(stripped) || /\btext-(left|right)\b/.test(stripped)) {
              offenders.push(`${file}:${i + 1}`);
            }
          }
        });
    }
    expect(offenders).toEqual([]);
  });
});
