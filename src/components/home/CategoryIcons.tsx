import { Link } from "react-router-dom";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import loungeSet from "@/assets/icons3d/lounge-set.png";
import sunbed from "@/assets/icons3d/sunbed.png";
import diningSet from "@/assets/icons3d/dining-set.png";
import coffeeTable from "@/assets/icons3d/coffee-table.png";
import fireTable from "@/assets/icons3d/fire-table.png";
import barChair from "@/assets/icons3d/bar-chair.png";
import diningChair from "@/assets/icons3d/dining-chair.png";
import umbrella from "@/assets/icons3d/umbrella.png";

const categories = [
  { slug: "מערכות-ישיבה", label: "מערכות ישיבה", icon: loungeSet },
  { slug: "מיטות-שיזוף", label: "מיטות שיזוף", icon: sunbed },
  { slug: "פינות-אוכל", label: "פינות אוכל", icon: diningSet },
  { slug: "שולחנות-קפה", label: "שולחנות קפה", icon: coffeeTable },
  { slug: "שולחנות-אש", label: "שולחנות אש", icon: fireTable },
  { slug: "כסאות-בר", label: "כסאות בר", icon: barChair },
  { slug: "כסאות-פינות-אוכל", label: "כסאות פינות אוכל", icon: diningChair },
  { slug: "akssvryz", label: "אקססוריז", icon: umbrella },
];

const CategoryIcons = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container-luxury">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel
            as="h2"
            he="גלו את הריהוט שלנו לפי קטגוריה"
            className="text-sm md:text-base mb-6"
          />
          <div className="w-16 h-px bg-primary/50 mx-auto" aria-hidden="true" />
        </Reveal>

        <Reveal>
          <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-5">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/collections#${c.slug}`}
                  className="group flex flex-col items-center text-center gap-3"
                >
                  {/* Clean tile instead of a floating PNG — lifts the icon off the sand */}
                  <div className="w-full aspect-square rounded-sm bg-card border border-border/70 flex items-center justify-center p-4 transition-smooth group-hover:border-primary/50 group-hover:shadow-soft group-hover:-translate-y-1">
                    <img
                      src={c.icon}
                      alt={c.label}
                      loading="lazy"
                      width={256}
                      height={256}
                      className="w-4/5 h-4/5 object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  </div>
                  <span className="text-foreground text-xs md:text-sm font-normal group-hover:text-primary transition-smooth">
                    {c.label}
                  </span>
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
