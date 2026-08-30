import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Radix — and therefore every shadcn/ui primitive in this project — does not
 * read direction from CSS or from the html element's dir attribute. It reads
 * it from React context and nothing else.
 *
 * Without a DirectionProvider the primitives stay left-to-right no matter how
 * the page looks: arrow keys move the wrong way through a Select, typeahead
 * and menu side resolution are computed for the wrong edge. Nothing looks
 * broken, which is why it survives.
 */

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("Radix direction", () => {
  it("is provided to the public tree, following the language", () => {
    const shell = read("src/components/LangShell.tsx");
    expect(shell).toMatch(/DirectionProvider/);
    // Not hardcoded rtl: /en is a left-to-right tree served by the same shell.
    expect(shell).toMatch(/LANGUAGE_DIR\[lang\]/);
  });

  it("is provided to the admin, which sits outside the language tree", () => {
    const layout = read("src/pages/admin/AdminLayout.tsx");
    expect(layout).toMatch(/DirectionProvider/);
    expect(layout).toMatch(/dir="rtl"/);
  });

  it("has the package it needs", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(pkg.dependencies["@radix-ui/react-direction"]).toBeTruthy();
  });
});
