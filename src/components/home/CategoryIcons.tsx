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
    <section className="py-16 md:py-24 bg-background">
      <div className="container-luxury">
        <Reveal className="mb-10 md:mb-14 flex flex-col items-center">
          <SectionHeading>גלו את הריהוט שלנו לפי קטגוריה</SectionHeading>
          <div className="w-12 h-px bg-cream mt-4" aria-hidden="true" />
        </Reveal>

        <Reveal>
          <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-5 max-w-3xl mx-auto">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/collections#${c.slug}`} className="group block">
                  <div className="relative w-full aspect-square rounded-sm bg-secondary/40 border border-border/70 overflow-hidden transition-smooth group-hover:border-primary/60 group-hover:shadow-luxury group-hover:-translate-y-1">
                    <img
                      src={c.img}
                      alt={c.label}
                      loading="lazy"
                      decoding="async"
                      width={1536}
                      height={1536}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.05] transition-smooth" />
                  </div>
                  <div className="mt-2.5 text-center">
                    <span className="text-foreground text-xs md:text-sm font-normal group-hover:text-primary transition-smooth">
                      {c.label}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
};

export default CategoryIcons;
