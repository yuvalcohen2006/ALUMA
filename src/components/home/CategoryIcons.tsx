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

const CategoryIcons = () => {
  return (
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
        {/* Focus behaviour: hovering one tile blurs and fades the other seven and
            scales the hovered one up, so attention lands on a single category
            instead of the whole row competing. Driven by `group/rail` on the list
            plus `peer`-less sibling dimming — each tile reacts to the rail being
            hovered, then overrides itself on its own hover. */}
        <ul className="group/rail rail-scroll flex gap-4 lg:gap-5 overflow-x-auto lg:overflow-x-visible px-5 sm:px-6 lg:px-[150px] pb-5 lg:pb-0">
          {categories.map((c) => (
            <li
              key={c.slug}
              // The siblings' blur waits 300ms — the length of the scale — so the
              // recede only happens once the hovered tile has finished growing,
              // rather than the whole row dimming the instant the pointer lands.
              // The hovered tile resets that delay so its own growth is immediate.
              className="shrink-0 w-[152px] sm:w-[180px] lg:flex-1 relative transition-all duration-300 ease-out delay-0
                         group-hover/rail:opacity-45 group-hover/rail:blur-[2px] group-hover/rail:delay-300
                         hover:!opacity-100 hover:!blur-0 hover:!delay-0 hover:scale-[1.08] hover:z-10"
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
          ))}
        </ul>
      </Reveal>
    </section>
  );
};

export default CategoryIcons;
