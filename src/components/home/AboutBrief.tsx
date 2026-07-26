import alumaLogo from "@/assets/aluma-logo.png";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

// Padding is deliberately symmetrical: the sand-beige category section starts
// exactly where this one's bottom padding ends, so the colour change reads as a
// clean edge rather than a drift.
const AboutBrief = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container-luxury">
        <Reveal className="max-w-3xl mx-auto flex flex-col items-center">
          <SectionHeading
            align="center"
            subtitle={
              <>
                {/* Baseline-aligned, nudged down 2px to settle onto the line and
                    5px to the left. Height is 3px shorter than 1.05em; sitting on
                    the baseline, the bottom stays put and the trim comes off the top. */}
                <img
                  src={alumaLogo}
                  alt="Aluma"
                  className="inline-block h-[calc(1.05em_-_3px)] w-auto align-baseline mx-1.5 -translate-x-[5px] translate-y-[2px]"
                />{" "}
                נולדה מתוך החיבור שבין חומר לאור. כל פריט נבנה בהתאמה אישית, בקווים
                נקיים ומדויקים, מתוך מחשבה על עיצוב, על נוחות ועל עמידות מלאה בתנאי
                חוץ. שלדת אלומיניום מתקדמת נפגשת בבדים שנבחרים אחד־אחד, והתוצאה היא
                ריהוט ששומר על היופי שלו גם אחרי שנים של שמש, גשם ומלח.
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
