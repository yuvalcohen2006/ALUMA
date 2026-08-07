import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import loungeSet from "@/assets/categories/lounge-set.jpg";
import sunbed from "@/assets/categories/sunbed.jpg";
import diningSet from "@/assets/categories/dining-set.jpg";
import coffeeTable from "@/assets/categories/coffee-table.jpg";
import fireTable from "@/assets/categories/fire-table.jpg";
import barChair from "@/assets/categories/bar-chair.jpg";
import diningChair from "@/assets/categories/dining-chair.jpg";
import umbrella from "@/assets/categories/umbrella.jpg";

type Tile = {
  id: string;
  img: string;
  /** Collection slug the primary button opens. */
  collection?: string;
  /** Small terracotta flag in the corner — first two tiles only. */
  badge?: "hot" | "popular";
  /** Full-bleed row of its own, rather than sharing one with a sibling. */
  wide?: boolean;
  /** White type on the night photographs, charcoal on the morning ones. */
  ink?: "dark" | "light";
};

/**
 * The rows alternate time of day, and the ink follows the photograph:
 * morning rows (soft golden light) take charcoal type, night rows (deep
 * purple, product lit) take white. The photo set was generated to this plan —
 * every image keeps its upper-middle clean sky for exactly this text.
 *
 *   row 1  מערכות ישיבה          wide   morning
 *   row 2  שולחנות אש            wide   night
 *   row 3  מיטות שיזוף · שולחנות קפה     morning
 *   row 4  כסאות בר · פינות אוכל          night
 *   row 5  כסאות פינות אוכל · אקססוריז    morning
 */
const tiles: Tile[] = [
  { id: "lounge", img: loungeSet, wide: true, badge: "hot", collection: "salons" },
  { id: "fire", img: fireTable, wide: true, ink: "light", badge: "popular", collection: "fire-tables" },
  { id: "sunbed", img: sunbed },
  { id: "coffee", img: coffeeTable },
  { id: "bar", img: barChair, ink: "light" },
  { id: "dining", img: diningSet, ink: "light" },
  { id: "chairs", img: diningChair },
  { id: "accessories", img: umbrella },
];

/**
 * The home page's catalogue, as a stack of full-bleed tiles.
 *
 * Deliberately has NO section heading. Apple's home page carries none either —
 * a tile whose own headline is "iPhone" doesn't need a "Products" label above
 * it, and neither does one that says "מערכות ישיבה". A heading here would only
 * announce what the pictures already say.
 *
 * The geometry is Apple's, from their own stylesheet: fixed tile heights rather
 * than viewport units (vh jitters as mobile browsers show and hide their URL
 * bar), a 12px seam between tiles in the page canvas colour, square corners,
 * and no max-width. The one departure is that the same 12px also runs down
 * both sides, so the tiles float in a consistent frame instead of butting
 * against the viewport edge.
 *
 * Where this departs from Apple, it follows what luxury furniture brands do
 * instead: the copy sits ON the photograph rather than in a white band above
 * it, because furniture photography supplies its own negative space, and the
 * links are ink rather than Apple's blue.
 */
const TILE_H = "h-[500px] md:h-[490px] lg:h-[580px]";

/* The tile CTA. Rendered as a <span> because the whole tile is already the
   link — a nested <a> would be invalid markup and a second tab stop for the
   same destination. */
const btnBase =
  "inline-flex h-11 items-center justify-center rounded-full border px-6 text-[16px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const btnDark =
  "border-foreground/30 text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground";
const btnLight =
  "border-background/50 text-background hover:border-accent hover:bg-accent hover:text-accent-foreground";

const CategoryMosaic = () => {
  const { to } = useLocalizedPath();
  const { t } = useTranslation("home");

  return (
    // The canvas colour shows through the 12px seams, so the gaps read as
    // hairlines rather than as holes. The same 12px runs along the top and
    // both sides, so every tile is framed by an identical margin rather than
    // being inset from its neighbours but flush with the screen.
    <section className="bg-background pt-3 px-3">
      <ul className="flex flex-wrap gap-3">
        {tiles.map((t_, i) => {
          const light = t_.ink === "light";
          return (
            <li
              key={t_.id}
              className={t_.wide ? "w-full" : "w-full md:w-[calc(50%-6px)]"}
            >
              {/* The tile itself is NOT a link — the buttons are, the way
                  Apple's own tiles work. A tile-wide link can only have one
                  destination, and nesting the buttons inside it would be
                  invalid markup and a duplicate tab stop for every tile.
                  No hover on the photograph either: a creeping zoom kept
                  pulling the eye to whichever tile the cursor rested on. */}
              <div
                className={`relative block w-full overflow-hidden ${TILE_H}`}
              >
                <img
                  src={t_.img}
                  alt={t(`tiles.${t_.id}.label`)}
                  // The first two tiles are above the fold on most screens.
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {t_.badge && (
                  <span className="absolute top-4 end-4 z-10 rounded-full bg-primary px-3 py-1 text-[13px] font-medium tracking-[0.04em] text-primary-foreground">
                    {t(`tiles.badge.${t_.badge}`)}
                  </span>
                )}

                {/* A scrim only where the words are, so the photograph stays
                    the subject. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1/2"
                  style={{
                    background: light
                      ? "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)"
                      : "linear-gradient(to bottom, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.25) 55%, transparent 100%)",
                  }}
                />

                {/* Top-centred, like Apple: 52px down on desktop, 42px below
                    that. The photograph fills the rest of the tile. */}
                <div
                  className={`relative z-10 text-center px-6 pt-[42px] lg:pt-[52px] ${
                    light ? "text-background" : "text-foreground"
                  }`}
                >
                  <h2 className="font-display font-semibold text-[36px] lg:text-[48px] leading-[1.1]">
                    {t(`tiles.${t_.id}.label`)}
                  </h2>
                  {/* Close under the title rather than a step down the scale —
                      the two lines read as one block of type. */}
                  <p
                    className={`mt-2 text-[20px] lg:text-[28px] leading-[1.25] ${
                      light ? "text-background/80" : "text-foreground-soft"
                    }`}
                  >
                    {t(`tiles.${t_.id}.tagline`)}
                  </p>

                  {/* Apple's tile CTAs, in our palette: a quiet outline that
                      fills with terracotta on hover instead of turning blue.
                      The wide tiles carry two, since they have the room and
                      they're the ones worth opening. */}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      to={t_.collection ? to(`/collections/${t_.collection}`) : to("/collections")}
                      className={`${btnBase} ${light ? btnLight : btnDark}`}
                    >
                      {t("tiles.cta.view")}
                    </Link>
                    {t_.wide && (
                      <Link
                        to={to("/collections")}
                        className={`${btnBase} ${light ? btnLight : btnDark}`}
                      >
                        {t("tiles.cta.all")}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CategoryMosaic;
