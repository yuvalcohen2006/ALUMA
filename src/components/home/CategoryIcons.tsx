import { useEffect, useRef, useState } from "react";
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

/** How long the pointer must rest on one tile before the row recedes. */
const DWELL_MS = 300;
/** How long the others take to fade and blur once it does. */
const RECEDE_MS = 400;

const CategoryIcons = () => {
  // Tracked in state rather than with CSS :hover on the list, because the list
  // includes the gaps between tiles — hovering the gap was dimming everything
  // while nothing was actually selected.
  const [focused, setFocused] = useState<string | null>(null);
  const dwellTimer = useRef<number | null>(null);

  const clearDwell = () => {
    if (dwellTimer.current !== null) {
      window.clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }
  };

  const onEnter = (slug: string) => {
    clearDwell();
    // Only commit after the pointer has genuinely settled, so sweeping across
    // the row on the way somewhere else never triggers the effect.
    dwellTimer.current = window.setTimeout(() => setFocused(slug), DWELL_MS);
  };

  const onLeave = () => {
    clearDwell();
    setFocused(null);
  };

  useEffect(() => clearDwell, []);

  return(
    <section className="py-24 md:py-32 bg-secondary">
      <div className="container-luxury">
        <Reveal className="mb-10 md:mb-14 flex flex-col items-center">
          {/* Charcoal, not terracotta: this heading sits on sand beige. */}
          <SectionHeading tone="charcoal">גלו את הריהוט שלנו לפי קטגוריה</SectionHeading>
          {/* Charcoal to match the heading — terracotta doesn't carry on sand. */}
          <div className="w-20 h-[2px] bg-foreground/55 mt-5" aria-hidden="true" />
        </Reveal>
      </div>

      <Reveal>
        {/* Desktop: all eight share one row inside a 150px inset — no scrolling, so
            no scrollbar renders either. Below lg it becomes a rail you swipe
            natively; that native touch scroll is the drag, so no JS drag needed. */}
        {/* Focus behaviour: once the pointer has rested on one tile for
            DWELL_MS, that tile scales up and the other seven blur and fade away
            over RECEDE_MS. Nothing happens while the pointer is merely passing
            over the row or sitting in a gap between tiles. */}
        <ul className="rail-scroll flex gap-4 lg:gap-5 overflow-x-auto lg:overflow-x-visible px-5 sm:px-6 lg:px-[150px] pb-5 lg:pb-0">
          {categories.map((c) => {
            const isFocused = focused === c.slug;
            const isReceded = focused !== null && !isFocused;
            return (
              <li
                key={c.slug}
                onMouseEnter={() => onEnter(c.slug)}
                onMouseLeave={onLeave}
                className={`shrink-0 w-[152px] sm:w-[180px] lg:flex-1 relative ease-out ${
                  isFocused ? "scale-[1.08] z-10" : ""
                } ${isReceded ? "opacity-45 blur-[2px]" : "opacity-100 blur-0"}`}
                style={{
                  // The recede is the slow part; the tile's own growth stays
                  // brisk so the one you picked responds immediately.
                  transition: `opacity ${RECEDE_MS}ms ease-out, filter ${RECEDE_MS}ms ease-out, transform 300ms ease-out`,
                }}
              >
                <Link to={`/collections#${c.slug}`} className="group block">
                  <div className="relative w-full aspect-square rounded-[14px] bg-background/50 border border-foreground/15 overflow-hidden transition-all duration-300 group-hover:border-foreground/35 group-hover:shadow-luxury">
                    <img
                      src={c.img}
                      alt={c.label}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      width={1536}
                      height={1536}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
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
