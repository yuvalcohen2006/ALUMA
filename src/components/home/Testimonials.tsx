import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "מיכל ואסף לוי",
    role: "וילה בכפר שמריהו",
    quote:
      "קיבלנו בדיוק את מה שחלמנו עליו — מערכת ישיבה שמרגישה כמו רהיט יוקרה בסלון, רק בחוץ. אחרי שנתיים מלאות של שמש וגשם הכל נראה כמו ביום הראשון. ליווי מקצועי מהשרטוט הראשון ועד ההתקנה.",
  },
  {
    name: "רוני ברק",
    role: "פנטהאוז בתל אביב",
    quote:
      "התלבטנו הרבה לפני שהזמנו, והיום אני יכולה להגיד שזו הייתה ההחלטה הכי טובה במרפסת. הצוות של Aluma הגיע אלינו, מדד, הציע פתרון לכל פינה, ובסוף קיבלנו סלון שכל אורח מתפעל ממנו.",
  },
  {
    name: "אדריכל יואב כהן",
    role: "סטודיו לעיצוב חוץ",
    quote:
      "אני עובד עם Aluma על פרויקטים של לקוחות פרימיום כבר שלוש שנים. הגימור, איכות האלומיניום ובדי ה-Sunbrella ברמה שאני לא מוצא בארץ אצל אף יצרן אחר. שותפים אמיתיים לעיצוב.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-32 gradient-cream">
      <div className="container-luxury">
        <Reveal className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <SectionLabel
            he="לקוחות מספרים"
            en="Testimonials"
            className="text-xs text-primary mb-3 md:mb-4"
          />
          <h2 className="font-display text-3xl sm:text-3xl sm:text-4xl md:text-5xl text-primary leading-tight">
            אנשים שכבר חיים
            <br />
            <span className="italic">את ה־Outdoor שלהם</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <article className="h-full bg-card border border-border/60 rounded-sm p-6 md:p-8 shadow-soft hover:shadow-luxury hover:-translate-y-1 transition-smooth flex flex-col">
                <Quote className="w-7 h-7 text-accent mb-5" aria-hidden="true" />
                <p className="text-primary/90 leading-relaxed text-base md:text-[17px] flex-1">
                  {t.quote}
                </p>
                <div className="mt-6 pt-5 border-t border-border/60">
                  <div className="flex items-center gap-1 mb-2" aria-label="5 מתוך 5 כוכבים">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <div className="font-display text-lg text-primary font-semibold">
                    {t.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
