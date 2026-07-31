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
  /** Full-bleed row of its own, rather than sharing one with a sibling. */
  wide?: boolean;
  /** White type on the night photographs, charcoal on the morning ones. */
  ink?: "dark" | "light";
  /** Collection slug to pre-filter on, once the catalogue taxonomy matches. */
  cat?: string;
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
  { id: "lounge", img: loungeSet, wide: true },
  { id: "fire", img: fireTable, wide: true, ink: "light" },
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
 * and no max-width — the tiles run edge to edge.
 *
 * Where this departs from Apple, it follows what luxury furniture brands do
 * instead: the copy sits ON the photograph rather than in a white band above
 * it, because furniture photography supplies its own negative space, and the
 * links are ink rather than Apple's blue.
 */
const TILE_H = "h-[500px] md:h-[490px] lg:h-[580px]";

const CategoryMosaic = () => {
  const { to } = useLocalizedPath();
  const { t } = useTranslation("home");

  return (
    // The canvas colour shows through the 12px seams, so the gaps read as
    // hairlines rather than as holes. pt-3 puts the same seam between the hero
    // and the first tile.
    <section className="bg-background pt-3">
      <ul className="flex flex-wrap gap-3">
        {tiles.map((t_, i) => {
          const light = t_.ink === "light";
          return (
            <li
              key={t_.id}
              className={t_.wide ? "w-full" : "w-full md:w-[calc(50%-6px)]"}
            >
              <Link
                to={t_.cat ? to(`/collections?cat=${t_.cat}`) : to("/collections")}
                className={`group relative block w-full overflow-hidden ${TILE_H} focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring`}
              >
                <img
                  src={t_.img}
                  alt={t(`tiles.${t_.id}.label`)}
                  // The first two tiles are above the fold on most screens.
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.28,0.11,0.32,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />

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
                  <h2 className="font-display font-semibold text-[32px] lg:text-[40px] leading-[1.125] lg:leading-[1.1]">
                    {t(`tiles.${t_.id}.label`)}
                  </h2>
                  <p
                    className={`mt-1 text-[19px] lg:text-[21px] leading-[1.21] lg:leading-[1.238] ${
                      light ? "text-background/80" : "text-foreground-soft"
                    }`}
                  >
                    {t(`tiles.${t_.id}.tagline`)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CategoryMosaic;
