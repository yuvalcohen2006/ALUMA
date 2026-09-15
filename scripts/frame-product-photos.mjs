// Square, furniture-centred copies of the product photos uploaded before the
// crop window existed.
//
//   node scripts/frame-product-photos.mjs            writes src/assets/products/
//   node scripts/frame-product-photos.mjs --preview  also writes a contact sheet
//
// Every product photo in the catalogue was uploaded on 1 and 6 September, a
// day before the admin gained its crop window — so they are whatever shape the
// file happened to be: 900×1125 portraits with a small table at the bottom,
// 1156×488 strips with a fire table running edge to edge. The product page
// showed the whole file letterboxed on a grey mat, and a plain centre square
// cuts a third of the catalogue in half.
//
// For each photo this finds the furniture against its studio backdrop, builds a
// square around it with the piece centred and at a consistent size, and where
// the square runs past the edge of the photo it continues the backdrop rather
// than painting a bar. The site swaps these in by file name (lib/framed-photos),
// so a photo uploaded through the crop window — already square, framed by the
// owner — is never touched, and replacing an old photo in the admin retires its
// copy here automatically.
//
// Photos with no plain backdrop (a lifestyle shot on a terrace) are left out:
// there is no "furniture against a background" to find, and the centre square
// the site already shows is the honest crop.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = "src/assets/products";
const PREVIEW = process.argv.includes("--preview");

/** How much of the square's longer side the piece should fill. */
const FILL = 0.74;
/** Never enlarge a photo more than this against its own short side. */
const MAX_ZOOM = 1.45;
/** Never shrink the photo inside the square past this much backdrop. */
const MAX_SIDE_OVER_LONG_EDGE = 1.12;
const OUT_MAX = 1200;
const OUT_MIN = 900;

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "")]),
);

const BUCKET = "/storage/v1/object/public/site-collections/";
const fileKey = (url) => url.split("?")[0].split("/").pop().replace(/\.[^.]+$/, "");

async function listPhotos() {
  const res = await fetch(
    `${env.VITE_SUPABASE_URL}/rest/v1/site_collection_products?select=slug,cover_url,gallery&order=sort_order`,
    { headers: { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_PUBLISHABLE_KEY}` } },
  );
  const rows = await res.json();
  const photos = [];
  for (const r of rows) {
    for (const url of [r.cover_url, ...(Array.isArray(r.gallery) ? r.gallery : [])]) {
      if (typeof url === "string" && url.includes(BUCKET)) photos.push({ slug: r.slug, url });
    }
  }
  return photos;
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
/**
 * Distance from the wall, with warmth counted twice. A grey shade on a beige
 * wall is the same brightness as the wall and a different colour, and plain
 * RGB distance could not see it; the wall's own shading changes brightness
 * and leaves its warmth alone, so this does not start seeing shadows either.
 */
const standsOut = (px, wall) => dist(px, wall) + 1.2 * Math.abs(px[0] - px[2] - (wall[0] - wall[2]));
const median = (values) => {
  const s = [...values].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
};
const medianColour = (px) => [0, 1, 2].map((c) => median(px.map((p) => p[c])));

/**
 * Where the furniture is, in source pixels, or null when the photo has no
 * plain backdrop to find it against.
 */
async function findPiece(buffer) {
  const meta = await sharp(buffer).rotate().metadata();
  const W = meta.width;
  const H = meta.height;
  const scale = 360 / Math.max(W, H);
  const w = Math.max(8, Math.round(W * scale));
  const h = Math.max(8, Math.round(H * scale));
  const { data } = await sharp(buffer).rotate().resize(w, h, { fit: "fill" }).blur(0.8).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => {
    const i = (y * w + x) * 3;
    return [data[i], data[i + 1], data[i + 2]];
  };

  // The backdrop, as a surface stretched between the four edges of the photo.
  // Studio backdrops shade from wall to floor and darken toward the sides, so
  // one colour for the frame read the lower half of every photo as furniture,
  // and one colour per row read the darker side of the room as a sofa.
  const band = Math.max(2, Math.round(Math.min(w, h) * 0.02));
  const edgeProfile = (length, sample) => {
    const raw = [];
    for (let i = 0; i < length; i++) {
      const px = [];
      for (let d = 0; d < band; d++) px.push(sample(i, d));
      raw.push(medianColour(px));
    }
    // Smoothed along the edge, so a chair leg that reaches the edge of the
    // photo does not become part of the wall.
    const win = Math.max(3, Math.round(length * 0.09));
    return raw.map((_, i) => medianColour(raw.slice(Math.max(0, i - win), Math.min(length, i + win + 1))));
  };
  const T = edgeProfile(w, (x, d) => at(x, d));
  const B = edgeProfile(w, (x, d) => at(x, h - 1 - d));
  const L = edgeProfile(h, (y, d) => at(d, y));
  const R = edgeProfile(h, (y, d) => at(w - 1 - d, y));
  const corner = (a, b) => a.map((v, i) => (v + b[i]) / 2);
  const TL = corner(T[0], L[0]);
  const TR = corner(T[w - 1], R[0]);
  const BL = corner(B[0], L[h - 1]);
  const BR = corner(B[w - 1], R[h - 1]);
  // A Coons patch: the blend that reproduces all four edges exactly.
  const wall = (x, y) => {
    const u = x / (w - 1);
    const v = y / (h - 1);
    return [0, 1, 2].map(
      (c) =>
        (1 - v) * T[x][c] + v * B[x][c] + (1 - u) * L[y][c] + u * R[y][c] -
        ((1 - u) * (1 - v) * TL[c] + u * (1 - v) * TR[c] + (1 - u) * v * BL[c] + u * v * BR[c]),
    );
  };

  // A plain backdrop is one where the border mostly matches it.
  let border = 0;
  let matching = 0;
  for (let x = 0; x < w; x++) {
    for (const y of [0, 1, h - 2, h - 1]) {
      border++;
      if (dist(at(x, y), wall(x, y)) < 20) matching++;
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, 1, w - 2, w - 1]) {
      border++;
      if (dist(at(x, y), wall(x, y)) < 20) matching++;
    }
  }
  const plain = matching / border;
  if (plain < 0.8) return { W, H, plain, box: null };

  // What is not backdrop. 24 rather than anything higher: a white pleated
  // shade on a beige wall is barely darker than the wall on its shadowed side,
  // and a higher cut found half a lamp.
  const piece = new Uint8Array(w * h);
  const rows = new Array(h).fill(0);
  const cols = new Array(w).fill(0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (standsOut(at(x, y), wall(x, y)) > 26) {
        piece[y * w + x] = 1;
        rows[y]++;
        cols[x]++;
      }
    }
  }
  // A row needs more than a pendant's cable in it to count as furniture, or
  // every hanging lamp is measured from the ceiling and drawn small at the
  // bottom of its square. A stool's legs still clear it.
  const rowMin = Math.max(4, Math.round(w * 0.02));
  const colMin = Math.max(4, Math.round(h * 0.02));
  const firstLast = (counts, min) => {
    const a = counts.findIndex((c) => c >= min);
    const b = counts.length - 1 - [...counts].reverse().findIndex((c) => c >= min);
    return a === -1 ? null : [a, b];
  };
  const ys = firstLast(rows, rowMin);
  const xs = firstLast(cols, colMin);
  if (!ys || !xs) return { W, H, plain, box: null };
  // Furniture filling the whole frame. On a clean backdrop that is a set cut
  // by the edges of its own photo, and the whole photo is the piece; on a
  // scene — sand, a terrace — the backdrop test was fooled, and there is
  // nothing to centre.
  const fillsFrame = xs[1] - xs[0] > w * 0.94 && ys[1] - ys[0] > h * 0.94;
  if (fillsFrame && plain < 0.9) return { W, H, plain, box: null };

  // The backdrop with the furniture painted out, for continuing the wall past
  // the photo's edge. Continuing the photo itself smeared whatever touched the
  // edge — a chair back cut by the top of the frame became a stripe to the top
  // of the square.
  const clean = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Grown by a few pixels, so the soft rim around a piece goes too.
      let near = false;
      for (let dy = -3; dy <= 3 && !near; dy++) {
        for (let dx = -3; dx <= 3 && !near; dx++) {
          const yy = y + dy;
          const xx = x + dx;
          if (yy >= 0 && yy < h && xx >= 0 && xx < w && piece[yy * w + xx]) near = true;
        }
      }
      const c = near ? wall(x, y) : at(x, y);
      const i = (y * w + x) * 3;
      clean[i] = c[0];
      clean[i + 1] = c[1];
      clean[i + 2] = c[2];
    }
  }
  // Blurred hard. The wall only has to carry its shading; any detail left in
  // its edge row is stretched into stripes across the continuation.
  const backdrop = await sharp(clean, { raw: { width: w, height: h, channels: 3 } }).blur(14).png().toBuffer();

  return {
    W,
    H,
    plain,
    backdrop,
    fillsFrame,
    box: {
      x: xs[0] / scale,
      y: ys[0] / scale,
      w: (xs[1] - xs[0] + 1) / scale,
      h: (ys[1] - ys[0] + 1) / scale,
    },
  };
}

/** The square, in source pixels. x and y may be negative. */
function frameFor({ W, H, box, fillsFrame }) {
  const short = Math.min(W, H);
  const long = Math.max(W, H);
  // The whole photo, squared with wall above and below and nothing cut.
  if (fillsFrame) return { x: (W - long) / 2, y: (H - long) / 2, side: long };
  let side = Math.max(box.w, box.h) / FILL;
  side = Math.max(side, short / MAX_ZOOM);
  side = Math.min(side, long * MAX_SIDE_OVER_LONG_EDGE);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  let x = cx - side / 2;
  let y = cy - side / 2;

  // A piece the photo itself cuts off — an armchair half out of the left of
  // the frame — keeps that edge as the square's edge. Continuing the wall past
  // it left the cut hanging in the middle of the square, with a slice of
  // shadow beside it.
  const pin = (pos, start, end, size) => {
    const atStart = start <= size * 0.005;
    const atEnd = end >= size * 0.995;
    if (atStart && atEnd) return (size - side) / 2;
    if (atStart) return Math.max(pos, 0);
    if (atEnd) return Math.min(pos, size - side);
    return pos;
  };
  x = pin(x, box.x, box.x + box.w, W);
  y = pin(y, box.y, box.y + box.h, H);
  return { x, y, side };
}

async function render(buffer, { W, H, backdrop }, frame) {
  const S = Math.round(frame.side);
  const left = Math.round(-frame.x);
  const top = Math.round(-frame.y);
  const src = sharp(buffer).rotate().removeAlpha();

  // Where the square runs past the photo, how far on each side.
  const over = {
    left: Math.max(0, left),
    top: Math.max(0, top),
    right: Math.max(0, S - (left + W)),
    bottom: Math.max(0, S - (top + H)),
  };

  // The part of the photo inside the square.
  const cut = {
    left: Math.max(0, -left),
    top: Math.max(0, -top),
    width: Math.min(W, S - left) - Math.max(0, -left),
    height: Math.min(H, S - top) - Math.max(0, -top),
  };
  const inside = await src.clone().extract(cut).png().toBuffer();

  if (!over.left && !over.top && !over.right && !over.bottom) return inside;

  // The wall, continued: the painted-out backdrop at full size, cut to the
  // same region, its edge stretched outward and blurred so the stretch reads
  // as more of the same wall.
  const plate = await sharp(backdrop).resize(W, H, { fit: "fill" }).extract(cut).png().toBuffer();
  const extended = await sharp(plate)
    .extend({ ...over, extendWith: "copy" })
    .blur(Math.max(12, S / 24))
    .png()
    .toBuffer();

  // Feather the photo into it, on the sides that meet the continuation only.
  // A smoothstep ramp, so there is no visible line where the ramp starts.
  const f = Math.max(6, Math.round(S * 0.035));
  const mw = cut.width;
  const mh = cut.height;
  const ramp = (edge, i) => (edge ? Math.min(1, i / f) : 1);
  const alpha = Buffer.alloc(mw * mh);
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const v = ramp(over.left, x) * ramp(over.right, mw - 1 - x) * ramp(over.top, y) * ramp(over.bottom, mh - 1 - y);
      alpha[y * mw + x] = Math.round(255 * v * v * (3 - 2 * v));
    }
  }
  const photo = await sharp(inside)
    .removeAlpha()
    .joinChannel(alpha, { raw: { width: mw, height: mh, channels: 1 } })
    .png()
    .toBuffer();

  // Flattened here: sharp resizes before it composites, so resizing the
  // unflattened pipeline would scale the backdrop and not the photo on it.
  return sharp(extended).composite([{ input: photo, left: over.left, top: over.top }]).png().toBuffer();
}

const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const photos = (await listPhotos()).filter((p) => !only || only.includes(p.slug));
fs.mkdirSync(OUT_DIR, { recursive: true });
const keep = new Set();
const sheet = [];

for (const { slug, url } of photos) {
  const key = fileKey(url);
  const buffer = Buffer.from(await (await fetch(url)).arrayBuffer());
  const found = await findPiece(buffer);
  const tag = `${slug.padEnd(10)} ${key}`;
  if (!found.box) {
    console.log(`${tag}  skipped (no plain backdrop, ${Math.round(found.plain * 100)}%)`);
    if (PREVIEW) sheet.push({ slug, key, square: await sharp(buffer).rotate().resize(300, 300, { fit: "cover" }).png().toBuffer(), skipped: true });
    continue;
  }
  const frame = frameFor(found);
  const image = sharp(await render(buffer, found, frame));
  const out = Math.min(OUT_MAX, Math.max(OUT_MIN, Math.round(frame.side)));
  const file = path.join(OUT_DIR, `${key}.webp`);
  // A grain of ±3 levels over the square before it is encoded. The continued
  // wall is a gradient so smooth that WebP quantises it into visible vertical
  // bands; grain the eye cannot see gives the encoder something to keep
  // instead. The photographs already carry more grain than this.
  const resized = await image.resize(out, out, { kernel: "lanczos3" }).removeAlpha().raw().toBuffer();
  let seed = 7;
  for (let i = 0; i < resized.length; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    resized[i] = Math.max(0, Math.min(255, resized[i] + ((seed >> 8) % 7) - 3));
  }
  await sharp(resized, { raw: { width: out, height: out, channels: 3 } })
    .webp({ quality: 88, smartSubsample: true, effort: 6 })
    .toFile(file);
  keep.add(`${key}.webp`);
  const kb = Math.round(fs.statSync(file).size / 1024);
  const bx = found.box;
  console.log(`${tag}  plain ${Math.round(found.plain * 100)}%  piece ${Math.round(bx.x)},${Math.round(bx.y)} ${Math.round(bx.w)}x${Math.round(bx.h)}`);
  console.log(`${tag}  ${found.W}x${found.H} → square ${Math.round(frame.side)} at (${Math.round(frame.x)},${Math.round(frame.y)}), ${out}px, ${kb}KB`);
  if (PREVIEW) sheet.push({ slug, key, square: await sharp(file).resize(300, 300).png().toBuffer() });
}

// Copies whose photo is no longer in the catalogue.
for (const f of only ? [] : fs.readdirSync(OUT_DIR)) {
  if (f.endsWith(".webp") && !keep.has(f)) {
    fs.unlinkSync(path.join(OUT_DIR, f));
    console.log(`removed ${f}`);
  }
}

if (PREVIEW) {
  const cols = 8;
  const T = 300;
  const rows = Math.ceil(sheet.length / cols);
  const comps = [];
  sheet.forEach((s, i) => {
    const left = (i % cols) * (T + 8);
    const top = Math.floor(i / cols) * (T + 28);
    comps.push({ input: s.square, left, top });
    comps.push({
      input: Buffer.from(`<svg width="${T}" height="24"><text x="2" y="17" font-size="15" font-family="Arial" fill="${s.skipped ? "#c00" : "#333"}">${s.slug}${s.skipped ? " (as is)" : ""}</text></svg>`),
      left,
      top: top + T,
    });
  });
  const preview = process.env.PREVIEW_OUT || "frame-preview.png";
  await sharp({ create: { width: cols * (T + 8), height: rows * (T + 28), channels: 3, background: "#fff" } }).composite(comps).png().toFile(preview);
  console.log(`preview → ${preview}`);
}
