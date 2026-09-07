import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * No photograph reaches storage without passing the crop step.
 *
 * The site crops every image again at display time, often at more than one
 * aspect ratio, and until the crop dialog existed nobody uploading could see
 * that happen — a chair shot near the edge of the frame lost its legs on the
 * home page and the person who uploaded it never found out.
 *
 * A new upload added later would bypass all of that silently, which is exactly
 * the kind of regression a person cannot see in review, so it is checked here.
 */

const ROOT = process.cwd();
const DIRS = ["src/pages/admin", "src/components/admin"];

function adminFiles(): string[] {
  const out: string[] = [];
  for (const dir of DIRS) {
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      if (entry.isDirectory()) continue;
      if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) {
        out.push(`${dir}/${entry.name}`);
      }
    }
  }
  return out;
}

const read = (f: string) => readFileSync(join(ROOT, f), "utf8");

describe("admin uploads", () => {
  it("only ever upload a cropped file", () => {
    const raw: string[] = [];
    for (const file of adminFiles()) {
      read(file)
        .split(/\r?\n/)
        .forEach((line, i) => {
          const trimmed = line.trimStart();
          // The provider's own doc comment shows the before-and-after, and a
          // guard that cannot tell a comment from a call punishes writing down
          // why something changed.
          if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
          const m = line.match(/uploadFile\(\s*[^,]+,\s*([A-Za-z_$][\w$]*)\s*\)/);
          if (m && m[1] !== "cropped") raw.push(`${file}:${i + 1} — uploads \`${m[1]}\``);
        });
    }
    expect(raw).toEqual([]);
  });

  /**
   * `image/*` matches image/heic, so a photo straight off an iPhone uploaded
   * successfully and then rendered as a broken image everywhere except Safari.
   * It also matches image/svg+xml, which is a script-bearing format going into
   * a public bucket.
   */
  it("do not accept every image type the browser will offer", () => {
    const loose: string[] = [];
    for (const file of adminFiles()) {
      read(file)
        .split(/\r?\n/)
        .forEach((line, i) => {
          if (/accept=["']image\/\*["']/.test(line)) loose.push(`${file}:${i + 1}`);
        });
    }
    expect(loose).toEqual([]);
  });

  /**
   * The size limit was printed above every upload box and enforced nowhere —
   * no check in any handler, no file_size_limit on any bucket. A 40MB photo
   * uploaded fine and the number was decoration.
   */
  it("enforce the size limit they advertise", () => {
    expect(read("src/lib/image-io.ts")).toMatch(/file\.size\s*>\s*MAX_UPLOAD_MB/);
  });
});

describe("photo specs", () => {
  /**
   * Four of the six specs used to describe a shape the site does not use. The
   * crop window and the previews are both driven from here, so a wrong number
   * is now a wrong crop rather than only wrong advice.
   */
  it("declare an output size and every shape the site really shows", () => {
    const src = read("src/lib/photo-specs.ts");
    const keys = [...src.matchAll(/^  (\w+): \{$/gm)].map((m) => m[1]);
    expect(keys.length).toBeGreaterThan(4);
    for (const key of keys) {
      const block = src.slice(src.indexOf(`  ${key}: {`), src.indexOf("\n  },", src.indexOf(`  ${key}: {`)));
      expect(block, `${key} needs an out size`).toMatch(/out: \{ w: \d+, h: \d+ \}/);
      expect(block, `${key} needs shownAt`).toMatch(/shownAt: \[/);
    }
  });
});
