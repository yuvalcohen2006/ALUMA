/**
 * The square, furniture-centred version of a product photograph, when there
 * is one.
 *
 * Every product photo in the catalogue was uploaded on 1 and 6 September, the
 * day before the admin gained its crop window, so each is whatever shape its
 * file happened to be — a small table at the foot of a tall portrait, a fire
 * table running edge to edge of a strip. The product page showed the whole
 * file letterboxed on a grey mat, and a plain centre square cut a third of the
 * catalogue in half.
 *
 * scripts/frame-product-photos.mjs found the furniture in each of those files
 * and built a square around it, with the wall continued where the square runs
 * past the photograph. This swaps them in by the storage file name:
 *
 *   - A photo uploaded through the crop window since then is already a square
 *     the owner framed, has a new name, and is returned untouched.
 *   - Replacing an old photo in the admin gives it a new name too, so its
 *     square here simply stops being used.
 *   - Only this project's own product bucket is matched, so nothing else that
 *     happens to share a file name can be swapped.
 */
const FRAMED = import.meta.glob<string>("../assets/products/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const BY_NAME = new Map(
  Object.entries(FRAMED).map(([file, url]) => [
    file.split("/").pop()!.replace(/\.webp$/, ""),
    url,
  ]),
);

const BUCKET = "/storage/v1/object/public/site-collections/";

export function framedPhoto(url: string): string;
export function framedPhoto(url: string | null): string | null;
export function framedPhoto(url: string | null): string | null {
  if (!url || !url.includes(BUCKET)) return url;
  const name = url.split(/[?#]/)[0].split("/").pop()?.replace(/\.[^.]+$/, "");
  return (name && BY_NAME.get(name)) || url;
}

/** How many photographs have a framed square. For the tests. */
export const framedCount = BY_NAME.size;
