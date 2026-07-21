import { ShieldCheck, Hammer, Truck, Sparkles, Award } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "אחריות עד 10 שנים",
    desc: "אחריות יצרן רשמית על אלומיניום ובדי Sunbrella®",
  },
  {
    icon: Hammer,
    title: "ייצור בעבודת יד",
    desc: "כל פריט נבנה בהזמנה אישית, במידות וגוונים שלך",
  },
  {
    icon: Truck,
    title: "משלוח והרכבה",
    desc: "שירות מקצועי עד הבית בכל רחבי הארץ",
  },
  {
    icon: Sparkles,
    title: "חומרים פרימיום",
    desc: "Sunbrella® · אלומיניום אדריכלי · גרניט פורצלן",
  },
  {
    icon: Award,
    title: "מעל 1,500 לקוחות מרוצים",
    desc: "פרויקטים בוילות, פנטהאוזים ובתי יוקרה בישראל",
  },
];

const TrustBar = () => {
  return (
    <section
      aria-label="היתרונות של Aluma"
      className="bg-secondary/40 border-y border-border/60 py-10 md:py-14"
    >
      <div className="container-luxury">
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <li
                key={it.title}
                className="flex flex-col items-center text-center gap-2 md:gap-3"
              >
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-primary/5 border border-primary/15 flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                </div>
                <div className="font-display text-sm md:text-base text-primary leading-tight">
                  {it.title}
                </div>
                <p className="text-[12px] md:text-xs text-muted-foreground leading-relaxed max-w-[18ch]">
                  {it.desc}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default TrustBar;
