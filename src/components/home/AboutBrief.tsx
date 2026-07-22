import alumaLogo from "@/assets/aluma-logo.png";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

const AboutBrief = () => {
  return (
    <section className="py-16 md:py-32 bg-background">
      <div className="container-luxury">
        <Reveal className="max-w-3xl mx-auto flex flex-col items-center">
          <SectionHeading
            align="center"
            subtitle={
              <>
                <img
                  src={alumaLogo}
                  alt="Aluma"
                  className="inline-block h-[0.85em] w-auto align-baseline mx-1 -translate-y-[0.05em]"
                />{" "}
                נולדה מתוך חיבור בין חומר לאור. כל פריט מיוצר בהתאמה אישית, בקווים
                נקיים ומדויקים, מתוך מחשבה על עיצוב, נוחות ועמידות מוחלטת לתנאי חוץ.
                <br />
                השילוב בין שלדת אלומיניום מתקדמת ואיכותית לבין בדים איכותיים, יוצר
                חוויה שלא משתווה לשום דבר אחר.
              </>
            }
          >
            הסיפור שלנו
          </SectionHeading>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutBrief;
