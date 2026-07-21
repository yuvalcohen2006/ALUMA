import { Trees, Waves, Mountain, Flame } from "lucide-react";

const materials = [
  {
    icon: Trees,
    name: "עץ טיק מלא",
    desc: "עמיד למים, לקרינת UV ולשינויי מזג אוויר. מתעצב בקצוות עם הזמן ומקבל פטינה אצילה.",
  },
  {
    icon: Waves,
    name: "אריגי Sunbrella",
    desc: "אריגים יוקרתיים בעמידות גבוהה, נושמים, אנטי-בקטריאליים ושומרים על גוונם לאורך שנים.",
  },
  {
    icon: Mountain,
    name: "אבן טבעית וטרצו",
    desc: "משטחי שולחן בעיבוד יד, כל לוח ייחודי בטקסטורה ובדגם. עמידים, קרים למגע ויפים לנצח.",
  },
  {
    icon: Flame,
    name: "אלומיניום ופלדה",
    desc: "מסגרות קשיחות בציפוי אבקה איכותי, עמידות לחלודה ולחות. אסתטיקה אדריכלית טהורה.",
  },
];

const Materials = () => {
  return (
    <section id="materials" className="py-24 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="container-luxury relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            חומרים
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mb-5 leading-tight">
            רק החומרים
            <br />
            <span className="italic">הטובים בעולם</span>
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            אנחנו מתפשרים על הכל, מלבד על איכות. כל חומר נבחר ביד, מספק עליו
            לעמוד בשנים של שמש, גשם ושימוש יומיומי.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {materials.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.name}
                className="p-8 rounded-sm border border-primary-foreground/10 hover:border-accent/40 hover:bg-primary-foreground/5 transition-smooth group"
              >
                <div className="w-12 h-12 rounded-sm gradient-gold flex items-center justify-center mb-6 shadow-gold group-hover:scale-110 transition-smooth">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-2xl mb-3">{m.name}</h3>
                <p className="text-primary-foreground/70 leading-relaxed text-sm">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Materials;
