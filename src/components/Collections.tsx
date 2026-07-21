const collections = [
  {
    name: "אקליפטוס",
    tag: "קלאסי",
    desc: "קווים נקיים, חמימות עץ טבעי וכריות בגוונים אדמתיים. הקולקציה האולטימטיבית למרפסת רגועה.",
  },
  {
    name: "מרינה",
    tag: "ימי",
    desc: "השראה מנופי הים התיכון. אריגי טק עמידים, אלומיניום שזור וקווי מתאר מינימליסטיים.",
  },
  {
    name: "סהרה",
    tag: "בוהו יוקרתי",
    desc: "טקסטורות עשירות, ראטן בעבודת יד וצבעי חול חמים. אווירה של נווה מדבר פרטי.",
  },
  {
    name: "מונוליט",
    tag: "אדריכלי",
    desc: "בטון מעודן, פלדה שחורה וקווים ארכיטקטוניים. הצהרה של עוצמה שקטה.",
  },
];

const Collections = () => {
  return (
    <section id="collections" className="py-24 md:py-32 gradient-cream">
      <div className="container-luxury">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            קולקציות
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-primary mb-5 leading-tight">
            ארבעה עולמות,
            <br />
            <span className="italic">השראה אחת</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            כל קולקציה היא שפה עיצובית שלמה — בחרו את הסיפור שמתאים לבית שלכם.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {collections.map((c, i) => (
            <article
              key={c.name}
              className="group relative bg-card rounded-sm overflow-hidden shadow-soft hover:shadow-luxury transition-smooth"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-sand to-secondary relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 font-display text-lg">
                  תמונה {i + 1}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs tracking-wider text-primary font-medium">
                  {c.tag}
                </div>
              </div>
              <div className="p-8">
                <h3 className="font-display text-2xl md:text-3xl text-primary mb-3 group-hover:text-accent transition-smooth">
                  {c.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
