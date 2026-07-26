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
          <div className="w-20 h-[2px] bg-primary/55 mt-5" aria-hidden="true" />
        </Reveal>
      </div>

      <Reveal>
        {/* Desktop: all eight share one row inside a 150px inset — no scrolling, so
            no scrollbar renders either. Below lg it becomes a rail you swipe
            natively; that native touch scroll is the drag, so no JS drag needed. */}
        <ul className="rail-scroll flex gap-4 lg:gap-5 overflow-x-auto lg:overflow-x-visible px-5 sm:px-6 lg:px-[150px] pb-5 lg:pb-0">
          {categories.map((c) => (
            <li key={c.slug} className="shrink-0 w-[152px] sm:w-[180px] lg:flex-1">
              <Link to={`/collections#${c.slug}`} className="group block">
                <div className="relative w-full aspect-square rounded-[14px] bg-background/50 border border-foreground/15 overflow-hidden transition-all duration-300 group-hover:border-primary/60 group-hover:shadow-luxury group-hover:-translate-y-1">
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
                  {/* A light terracotta wash rises from the base on hover — just a
                      breath of warmth, nothing heavy. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-primary/20 via-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
                <div className="mt-3 text-center">
                  {/* Label stays charcoal on hover — the tile lift + wash carry it. */}
                  <span className="inline-block text-foreground text-sm md:text-[15px] font-normal">
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
