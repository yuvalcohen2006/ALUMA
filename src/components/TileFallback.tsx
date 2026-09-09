/**
 * What fills a tile whose photograph has not been uploaded yet.
 *
 * The alternative was an `<img>` with an empty src, which browsers resolve to
 * the current page, re-request, fail to decode, and paint as a broken-image
 * glyph — and an owner can reach that state in the admin just by saving a
 * project with a title and nothing else.
 *
 * `aria-hidden`, because the tile's own title says the name properly. Without
 * it a collection called "סלון" is announced as "ס, סלון".
 */
const TileFallback = ({ name }: { name: string }) => (
  <div className="grid h-full w-full place-items-center bg-muted" aria-hidden="true">
    <span className="font-display text-heading text-foreground/40">{name.charAt(0)}</span>
  </div>
);

export default TileFallback;
