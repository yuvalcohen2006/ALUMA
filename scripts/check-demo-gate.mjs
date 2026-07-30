/**
 * Fails the build if placeholder content reaches the production bundle.
 *
 * The site ships with a demo catalogue and a demo magazine so the pages can be
 * designed against realistic content while the real tables are still empty.
 * Those images are invented products and invented articles. If they reach
 * production, the site advertises furniture that does not exist.
 *
 * The gating itself is `import.meta.env.DEV` checks in the data hooks, which
 * Rollup then tree-shakes. That works right up until something imports a demo
 * module for an unrelated reason — a slug lookup, a single photo — at which
 * point every image in that module is anchored into the bundle and no type
 * error or lint rule notices. It has already happened once: the /ar page read
 * product names out of the demo catalogue and pulled all 34 demo photos in
 * behind them.
 *
 * So the rule is checked against the built output, where it is a fact rather
 * than an intention: nothing from a demo asset folder may appear in dist.
 *
 * If a demo image is genuinely needed as real UI, copy it out of the demo
 * folder into its own home (see src/assets/fabric/sofa-preview.webp). Do not
 * add an exception here — an exception list is how the rule dies.
 */
import { existsSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";

/** Folders whose entire contents are placeholder content. */
const DEMO_DIRS = ["src/assets/collections/gen", "src/assets/blog/gen"];
const DIST_ASSETS = "dist/assets";

/** Vite emits `<name>-<8-char hash><ext>`; recover the authored name. */
const sourceStem = (file) => {
  const stem = basename(file, extname(file));
  return stem.replace(/-[A-Za-z0-9_-]{8}$/, "");
};

if (!existsSync(DIST_ASSETS)) {
  console.error(`✗ demo gate: ${DIST_ASSETS} not found — run the build first.`);
  process.exit(1);
}

const demo = new Map();
for (const dir of DEMO_DIRS) {
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    demo.set(basename(file, extname(file)), join(dir, file));
  }
}

if (demo.size === 0) {
  console.error(
    "✗ demo gate: found no demo assets to check for. The folders moved or " +
      "were renamed, and this check is now silently passing. Update DEMO_DIRS.",
  );
  process.exit(1);
}

const leaked = readdirSync(DIST_ASSETS)
  .filter((file) => demo.has(sourceStem(file)))
  .map((file) => `${file}  ←  ${demo.get(sourceStem(file))}`);

if (leaked.length > 0) {
  console.error(
    `\n✗ demo gate: ${leaked.length} placeholder asset(s) reached the production bundle:\n`,
  );
  for (const line of leaked) console.error(`    ${line}`);
  console.error(
    "\n  Something in the production graph imports a demo data module. Find it\n" +
      "  with:  npx vite build --mode production && npx vite-bundle-visualizer\n" +
      "  or grep for imports of src/data/demo*.ts outside a DEV-only branch.\n",
  );
  process.exit(1);
}

console.log(`✓ demo gate: ${demo.size} placeholder assets, none in the bundle.`);
