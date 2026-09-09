/**
 * Read a URL fragment without letting it take the site down.
 *
 * `decodeURIComponent` throws URIError on a malformed percent-escape, and a
 * fragment is the easiest place in a URL for one to appear: someone shares a
 * link ending "#50%", a messaging app clips a Hebrew anchor mid-escape and
 * leaves "#%D7", or a bot probes "#%". Thrown inside an effect, that error
 * unmounts the tree and the root boundary replaces the whole page with the
 * error screen — a stray character in a fragment taking down the catalogue.
 *
 * The raw text is the right fallback: it will simply match no element, which
 * is exactly what a nonsense fragment should do.
 */
export const decodeHash = (hash: string): string => {
  const raw = hash.replace(/^#/, "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};
