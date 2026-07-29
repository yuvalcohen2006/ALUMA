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
            divider={false}
            subtitle={
              <>
                {/* The running text's own face — only the colour marks it as the
                    brand name. The shuruk on the ו fixes the reading as a-LU-ma;
                    unvocalised, the word is ambiguous. */}
                <span className="text-primary">אלוּמה</span> נולדה מתוך החיבור שבין חומר לאור. כל פריט נבנה בהתאמה אישית, בקווים
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
