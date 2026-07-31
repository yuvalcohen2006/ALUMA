import { Link } from "react-router-dom";
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
  label: string;
  tagline: string;
  img: string;
  /** Full-bleed row of its own, rather than sharing one with a sibling. */
  wide?: boolean;
  /**
   * Reserved for a future tile shot against a genuinely dark sky. Every current
   * photograph has a bright top — even the dusk fire-table one, whose sky is
   * pale blue over a white villa — so they all take dark type on a light scrim.
   * Setting this on a bright photo makes the headline disappear.
   */
  ink?: "dark" | "light";
  /** Collection slug to pre-filter on, once the catalogue taxonomy matches. */
  cat?: string;
};

const tiles: Tile[] = [
  { id: "lounge", label: "מערכות ישיבה", tagline: "סלון שממשיך אל מחוץ לבית.", img: loungeSet, wide: true },
  { id: "fire", label: "שולחנות אש", tagline: "הערב לא נגמר עם השקיעה.", img: fireTable, wide: true },
  { id: "dining", label: "פינות אוכל", tagline: "ארוחות ארוכות, מתחת לשמיים.", img: diningSet },
  { id: "sunbed", label: "מיטות שיזוף", tagline: "המקום הכי שקט בבית.", img: sunbed },
  { id: "coffee", label: "שולחנות קפה", tagline: "אבן שנשארת יפה שנים.", img: coffeeTable },
  { id: "bar", label: "כסאות בר", tagline: "לעמוד ליד, ולא למהר.", img: barChair },
  { id: "chairs", label: "כסאות פינות אוכל", tagline: "לשבת בנוח, גם בחוץ.", img: diningChair },
  { id: "accessories", label: "אקססוריז", tagline: "צל, כריות ותאורה.", img: umbrella },
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

  return (
    // The canvas colour shows through the 12px seams, so the gaps read as
    // hairlines rather than as holes.
    <section className="bg-background">
      <ul className="flex flex-wrap gap-3">
        {tiles.map((t, i) => {
          const light = t.ink === "light";
          return (
            <li
              key={t.id}
              className={t.wide ? "w-full" : "w-full md:w-[calc(50%-6px)]"}
            >
              <Link
                to={t.cat ? to(`/collections?cat=${t.cat}`) : to("/collections")}
                className={`group relative block w-full overflow-hidden ${TILE_H} focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring`}
              >
                <img
                  src={t.img}
                  alt={t.label}
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
                    {t.label}
                  </h2>
                  <p
                    className={`mt-1 text-[19px] lg:text-[21px] leading-[1.21] lg:leading-[1.238] ${
                      light ? "text-background/80" : "text-foreground-soft"
                    }`}
                  >
                    {t.tagline}
                  </p>
                  <span
                    className={`mt-5 inline-block text-[19px] lg:text-[21px] underline-offset-[6px] decoration-1 group-hover:underline ${
                      light ? "text-background" : "text-primary"
                    }`}
                  >
                    לצפייה
                  </span>
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
