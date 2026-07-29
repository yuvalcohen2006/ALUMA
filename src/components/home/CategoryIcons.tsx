import { useState } from "react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import loungeSet from "@/assets/categories/lounge-set.jpg";
import sunbed from "@/assets/categories/sunbed.jpg";
import diningSet from "@/assets/categories/dining-set.jpg";
import coffeeTable from "@/assets/categories/coffee-table.jpg";
import fireTable from "@/assets/categories/fire-table.jpg";
import barChair from "@/assets/categories/bar-chair.jpg";
import diningChair from "@/assets/categories/dining-chair.jpg";
import umbrella from "@/assets/categories/umbrella.jpg";

const categories = [
  { slug: "מערכות-ישיבה", label: "מערכות ישיבה", img: loungeSet },
  { slug: "מיטות-שיזוף", label: "מיטות שיזוף", img: sunbed },
  { slug: "פינות-אוכל", label: "פינות אוכל", img: diningSet },
  { slug: "שולחנות-קפה", label: "שולחנות קפה", img: coffeeTable },
  { slug: "שולחנות-אש", label: "שולחנות אש", img: fireTable },
  { slug: "כסאות-בר", label: "כסאות בר", img: barChair },
  { slug: "כסאות-פינות-אוכל", label: "כסאות פינות אוכל", img: diningChair },
  { slug: "akssvryz", label: "אקססוריז", img: umbrella },
];

/** Every part of the hover — grow, dim, blur — runs on this one duration, so
 *  the row reacts as a single movement rather than in stages. */
const HOVER_MS = 200;

const CategoryIcons = () => {
  // Tracked in state rather than with CSS :hover on the list, because the list
  // includes the gaps between tiles — hovering the gap was dimming everything
  // while nothing was actually selected.
  // Still tracked per tile in state rather than with CSS :hover on the list —
  // the list includes the gaps between tiles, and hovering a gap was dimming
  // everything while nothing was actually selected.
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="py-24 md:py-32 bg-secondary">
      <div className="container-luxury">
        <Reveal className="mb-16 md:mb-20 flex flex-col items-center">
          {/* Charcoal, not terracotta: this heading sits on sand beige. */}
          <SectionHeading tone="charcoal">גלו את הריהוט שלנו לפי קטגוריה</SectionHeading>
        </Reveal>
      </div>

      <Reveal>
        {/* Desktop: all eight share one row inside a 150px inset — no scrolling, so
            no scrollbar renders either. Below lg it becomes a rail you swipe
            natively; that native touch scroll is the drag, so no JS drag needed. */}
        {/* Focus behaviour: pointing at a tile grows it and softens the other
            seven, all on one duration so it reads as a single movement. */}
        <ul className="rail-scroll flex gap-4 lg:gap-5 overflow-x-auto lg:overflow-x-visible px-5 sm:px-6 lg:px-[150px] pb-5 lg:pb-0">
          {categories.map((c) => {
            const isHovered = hovered === c.slug;
            const isReceded = hovered !== null && !isHovered;
            return (
              <li
                key={c.slug}
                onMouseEnter={() => setHovered(c.slug)}
                onMouseLeave={() => setHovered(null)}
                className={`shrink-0 w-[152px] sm:w-[180px] lg:flex-1 relative ease-out ${
                  isHovered ? "scale-[1.08] z-10" : ""
                } ${isReceded ? "opacity-70 blur-[1px]" : "opacity-100 blur-0"}`}
                style={{
                  // One duration for all three properties: the tile grows while
                  // the others soften, in step.
                  transition: `transform ${HOVER_MS}ms ease-out, opacity ${HOVER_MS}ms ease-out, filter ${HOVER_MS}ms ease-out`,
                }}
              >
                <Link to={`/collections#${c.slug}`} className="block">
                  <div
                    className={`relative w-full aspect-square rounded-[14px] bg-background/50 border overflow-hidden ${
                      isHovered ? "border-foreground/35 shadow-luxury" : "border-foreground/15"
                    }`}
                    style={{ transition: `border-color ${HOVER_MS}ms ease-out, box-shadow ${HOVER_MS}ms ease-out` }}
                  >
                    {/* Driven by the same state and the same duration as the tile
                        so the two grow as one movement. Previously the image ran
                        off CSS :hover at 600ms while the tile waited out the
                        dwell, which read as two separate phases. */}
                    <img
                      src={c.img}
                      alt={c.label}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      width={1536}
                      height={1536}
                      className={`absolute inset-0 w-full h-full object-cover ${
                        isHovered ? "scale-[1.06]" : "scale-100"
                      }`}
                      style={{ transition: `transform ${HOVER_MS}ms ease-out` }}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <span className="inline-block text-foreground text-[18px] font-normal">
                      {c.label}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
};

export default CategoryIcons;
