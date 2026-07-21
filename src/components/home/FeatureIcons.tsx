import { Gem, Hammer, Ruler, ShieldCheck, Sprout } from "lucide-react";
import alumaLogo from "@/assets/aluma-logo.png";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";

const features = [
  {
    icon: Gem,
    title: "חומרים איכותיים",
    desc: "אלומיניום פרימיום ושיש גרניט פורצלן עמיד לכל מזג אוויר.",
  },
  {
    icon: Ruler,
    title: "ייצור אישי",
    desc: "כל סלון נתפר במידות ובסגנון שמתאימים בדיוק למרחב שלכם.",
  },
  {
    icon: Hammer,
    title: "מלאכת יד",
    desc: "ייצור מקומי בקפידה, תוך תשומת לב לכל פרט וחיבור.",
  },
  {
    icon: ShieldCheck,
    title: "אחריות לאורך זמן",
    desc: "מבנה יציב וגימור שעומד מול שמש, גשם ומלח בלי להתפשר.",
  },
  {
    icon: Sprout,
    title: "עיצוב רגוע ונקי",
    desc: "קווים מינימליסטיים שמשתלבים בטבע ומשדרים שלווה.",
  },
];

const FeatureIcons = () => {
  return (
    <section className="py-20 md:py-28 gradient-cream">
      <div className="container-luxury">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel
            as="h2"
            he={
              <>
                למה
                <img src={alumaLogo} alt="Aluma" className="h-[0.9em] w-auto inline-block" />
              </>
            }
            en="Why Aluma"
            className="text-sm md:text-base font-light mb-8"
          />
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-16 bg-primary/30" />
            <span className="w-1.5 h-1.5 rotate-45 bg-primary" />
            <span className="h-px w-16 bg-primary/30" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <Reveal
              key={title}
              delay={i * 100}
              className="group text-center flex flex-col items-center px-2"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-primary/20 bg-background/60 flex items-center justify-center mb-5 transition-smooth group-hover:border-accent group-hover:shadow-soft group-hover:-translate-y-1">
                <Icon
                  className="w-7 h-7 md:w-8 md:h-8 text-primary group-hover:text-accent transition-smooth"
                  strokeWidth={1.4}
                />
              </div>
              <h3 className="font-display text-lg md:text-xl text-primary mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureIcons;
