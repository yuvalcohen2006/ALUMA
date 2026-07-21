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
    <section className="py-16 md:py-24 bg-secondary/40">
      <div className="container-luxury">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel
            as="h2"
            he="גלו את הריהוט שלנו לפי קטגוריה"
            en="Discover by Category"
            className="text-sm md:text-base font-light mb-6"
          />
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-16 bg-primary/30" />
            <span className="w-1.5 h-1.5 rotate-45 bg-primary" />
            <span className="h-px w-16 bg-primary/30" />
          </div>
        </Reveal>

        <Reveal>
          <ul className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-6 md:gap-8">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/collections#${c.slug}`}
                  className="group flex flex-col items-center text-center gap-3 p-3 rounded-lg transition-smooth hover:-translate-y-1"
                >
                  <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <img
                      src={c.icon}
                      alt={c.label}
                      loading="lazy"
                      width={256}
                      height={256}
                      className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.08)]"
                    />
                  </div>
                  <span className="text-primary text-sm md:text-base font-light group-hover:text-accent transition-smooth">
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
