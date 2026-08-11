type CollectionBandProps = {
  /** Photograph behind the name. Renders a plain sand panel when absent. */
  image: string | null;
  name: string;
  /** h1 on a collection's own page, h2 in the index listing. */
  as?: "h1" | "h2";
  eager?: boolean;
};

/**
 * A collection's name, set as large as the band will carry, over its photograph.
 *
 * Shared by the index and by each collection's own page so the two are the same
 * object — arriving on the detail page should feel like the band you clicked
 * simply grew, and that only holds if there is one implementation of it.
 *
 * NO SCRIM. Both pages used to lay a `from-black/60` linear gradient across the
 * whole band, which read as a grey bar sitting under the words and flattened
 * the photograph it was supposed to be showing off. Legibility now comes from
 * two places instead:
 *
 *   1. The photographs are chosen/generated with a calm, mid-tone area on the
 *      reading edge — the negative space the type sits in is IN the picture.
 *   2. A wide, soft shadow on the letterforms themselves. At 40px of blur it
 *      darkens the air immediately around each letter without drawing an edge
 *      anywhere, so it reads as depth rather than as an overlay.
 *
 * Type this large is what makes that affordable: WCAG's large-text threshold is
 * 3:1 rather than the 4.5:1 body text needs, and at 240px we are far past any
 * definition of large. The shadow is what carries it over a bright photograph —
 * so if a picture is ever swapped for one that is blown out on the reading
 * edge, that is a photo problem to fix in the photo, not a reason to put the
 * grey bar back.
 */
const CollectionBand = ({ image, name, as = "h2", eager = false }: CollectionBandProps) => {
  const Tag = as;

  return (
    <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden rounded-[14px] bg-secondary/50">
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* text-start puts this on the right in Hebrew and the left in English,
          which is the edge the photographs keep clear. */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full px-6 md:px-12">
          <Tag
            className="font-display font-semibold text-white text-start leading-[0.88] text-[clamp(56px,16vw,240px)]"
            style={{
              textShadow: "0 1px 2px rgba(0,0,0,0.28), 0 4px 40px rgba(0,0,0,0.42)",
            }}
          >
            {name}
          </Tag>
        </div>
      </div>
    </div>
  );
};

export default CollectionBand;
