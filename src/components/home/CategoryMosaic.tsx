import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import loungeSet from "@/assets/categories/lounge-set.jpg";
import sunbed from "@/assets/categories/sunbed.jpg";
import diningSet from "@/assets/categories/dining-set.jpg";
import coffeeTable from "@/assets/categories/coffee-table.jpg";
import fireTable from "@/assets/categories/fire-table.jpg";
import barChair from "@/assets/categories/bar-chair.jpg";
import diningChair from "@/assets/categories/dining-chair.jpg";
import umbrella from "@/assets/categories/umbrella.jpg";

type Category = {
  id: string;
  label: string;
  /** One-line teaser, shown over the photo on the wide tiles only. */
  teaser?: string;
  img: string;
  /** Wide tiles span two columns and carry the teaser. */
  wide?: boolean;
  /**
   * Collection slug to pre-filter on. Left unset until the real catalogue
   * exists — these marketing categories don't map onto the CMS collection
   * slugs yet, and linking to `?cat=<unknown>` lands the visitor on an empty
   * results page, which is worse than landing on the full catalogue.
   */
  cat?: string;
};

/**
 * Widths are deliberately arranged so every desktop row sums to exactly four
 * columns — 2+1+1, 1+1+2, 2+2 — which is what keeps the mosaic reading as a
 * designed grid rather than a masonry wall with ragged edges.
 */
const categories: Category[] = [
  { id: "lounge", label: "מערכות ישיבה", teaser: "סלוני חוץ מודולריים", img: loungeSet, wide: true },
  { id: "sunbed", label: "מיטות שיזוף", img: sunbed },
  { id: "dining", label: "פינות אוכל", img: diningSet },
  { id: "coffee", label: "שולחנות קפה", img: coffeeTable },
  { id: "bar", label: "כסאות בר", img: barChair },
  { id: "fire", label: "שולחנות אש", teaser: "חום ואור לערבים בחוץ", img: fireTable, wide: true },
  { id: "chairs", label: "כסאות פינות אוכל", teaser: "לשבת בנוח, גם בחוץ", img: diningChair, wide: true },
  { id: "accessories", label: "אקססוריז", teaser: "שמשיות, כריות ותאורה", img: umbrella, wide: true },
];

/**
 * The home page's centrepiece: the catalogue, shown as photographs.
 *
 * Replaces a rail of eight small square icons that squashed to ~73px each on a
 * 1024px screen — at that size the label wrapped to three lines and the
 * furniture was unreadable, which is the opposite of "here is the range".
 *
 * Rows align without any masonry maths: grid items stretch to their row's
 * height by default, so the aspect ratios only set each tile's natural
 * proportion and the image fills whatever cell it lands in.
 */
const CategoryMosaic = () => {
  const { to } = useLocalizedPath();

  return (
    <section className="section-pad bg-secondary">
      <div className="container-luxury">
        <Reveal className="mb-12 md:mb-16 flex flex-col items-center">
          {/* Charcoal, not terracotta: this heading sits on sand beige. */}
          <SectionHeading tone="charcoal" subtitle="מסלוני חוץ ופינות אוכל ועד שולחנות אש — כל מה שהופך חצר למקום שנשארים בו.">
            הקטגוריות שלנו
          </SectionHeading>
        </Reveal>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-[1440px] mx-auto">
          {categories.map((c, i) => (
            <li
              key={c.id}
              className={c.wide ? "sm:col-span-2" : ""}
            >
              <Reveal delay={(i % 4) * 70}>
                <Link
                  to={c.cat ? to(`/collections?cat=${c.cat}`) : to("/collections")}
                  className="group relative block h-full overflow-hidden rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <div className={c.wide ? "aspect-[8/5]" : "aspect-[4/5]"}>
                    <img
                      src={c.img}
                      alt={c.label}
                      width={1536}
                      height={1536}
                      // The first row is above the fold on most screens.
                      loading={i < 3 ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </div>

                  {/* Scrim, not a solid bar: the photograph is the pitch, so the
                      label has to sit on it without covering the furniture. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 transition-opacity duration-[600ms] opacity-90 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.16) 35%, transparent 65%)",
                    }}
                  />

                  <div className="absolute bottom-0 start-0 end-0 p-5 md:p-6 flex items-end gap-2 text-background">
                    <div className="min-w-0">
                      <h3 className="font-display font-medium text-[21px] md:text-[26px] leading-tight">
                        {c.label}
                      </h3>
                      {c.teaser && (
                        <p className="mt-1 text-[15px] leading-snug text-background/75">
                          {c.teaser}
                        </p>
                      )}
                    </div>
                    {/* Points the reading direction: flipped under LTR. */}
                    <ArrowLeft
                      className="w-4 h-4 mb-1.5 shrink-0 transition-transform duration-500 group-hover:-translate-x-1 ltr:-scale-x-100 ltr:group-hover:translate-x-1 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CategoryMosaic;
