import alumaLogo from "@/assets/aluma-logo.png";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";

const AboutBrief = () => {
  return (
    <section className="py-16 md:py-32 bg-background">
      <div className="container-luxury">
        <Reveal className="max-w-3xl mx-auto text-center">
          <SectionLabel
            as="h2"
            he="הסיפור שלנו"
            en="Our Story"
            className="text-sm md:text-base font-light mb-8"
          />

          <div className="flex items-center justify-center gap-3 mb-10" aria-hidden="true">
            <span className="h-px w-16 bg-primary/30" />
            <span className="w-1.5 h-1.5 rotate-45 bg-primary" />
            <span className="h-px w-16 bg-primary/30" />
          </div>
          <p className="text-primary text-base md:text-xl leading-relaxed font-light">
            <img
              src={alumaLogo}
              alt="Aluma"
              className="inline-block h-[0.85em] w-auto align-baseline mx-1 -translate-y-[0.05em]"
            />{" "}
            נולדה מתוך חיבור בין חומר לאור. כל פריט מיוצר בהתאמה אישית, בקווים
            נקיים ומדויקים, מתוך מחשבה על עיצוב, נוחות ועמידות מוחלטת לתנאי חוץ.
            <br />
            השילוב בין שלדת אלומיניום מתקדמת ואיכותית לבין בדים איכותיים — יוצר
            חוויה שלא משתווה לשום דבר אחר.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutBrief;

