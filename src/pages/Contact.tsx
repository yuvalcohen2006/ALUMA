import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import Contact from "@/components/Contact";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import ShowroomBand from "@/components/contact/ShowroomBand";

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "דף הבית", item: "https://alumaoutdoor.com/" },
    { "@type": "ListItem", position: 2, name: "צרו קשר", item: "https://alumaoutdoor.com/contact" },
  ],
};

/**
 * What a lead can expect once the form is gone. This is the page's answer to
 * the quiet question every contact form raises — "and then what?" — so it is
 * deliberately a numbered rail on a hairline, not another centred
 * heading-plus-button band like the other pages close on.
 */
const nextSteps = [
  {
    n: "01",
    title: "חוזרים אליכם",
    line: "בתוך יום עסקים אחד נתקשר או נכתוב בוואטסאפ, ונשמע מכם על החלל, על המידות ועל השימוש היומיומי.",
  },
  {
    n: "02",
    title: "מתכננים יחד",
    line: "בוחרים חומרים, בדים ופרופורציות. אפשר באולם התצוגה ביציץ, ואפשר במדידה אצלכם בבית.",
  },
  {
    n: "03",
    title: "מקבלים הצעה",
    line: "הצעת מחיר מפורטת, עם לוח זמנים לייצור ולהתקנה. בלי התחייבות ובלי הפתעות בהמשך.",
  },
];

/**
 * Contact runs in three movements:
 *   1. the split — the form on the right, the direct channels sticky on the left
 *   2. the charcoal showroom band — the one dark surface, with live hours
 *   3. the warm-white "what happens next" rail, which also keeps the dark band
 *      from butting straight into the dark footer
 */
const ContactPage = () => {
  return (
    <Layout>
      <SEO
        title="צרו קשר | Aluma, סלוני חוץ בעיצוב אישי"
        description="ספרו לנו על הפרויקט שלכם, צוות Aluma חוזר אליכם להתאמה אישית מלאה. טלפון 050-451-9062, מייל info@aluma.co.il, אולם תצוגה ביציץ."
        path="/contact"
        jsonLd={breadcrumbs}
      />

      <PageHero
        title="צרו קשר"
        subtitle="כאן אפשר לכתוב לנו, להרים טלפון, לשלוח וואטסאפ או לתאם ביקור באולם התצוגה ביציץ. בכל דרך שתבחרו, אותו צוות עונה."
      />

      <Contact />
      <ShowroomBand />

      <section dir="rtl" className="py-16 md:py-24 bg-background">
        <div className="container-luxury">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <SectionHeading
                align="start"
                subtitle="אף פנייה לא נופלת בין הכיסאות. זה בדיוק מה שקורה מהרגע שההודעה נשלחת ועד שהסלון עומד אצלכם בחצר."
              >
                מה קורה אחרי שתשלחו
              </SectionHeading>
            </Reveal>

            {/* The rail: numerals threaded on one hairline. In RTL it reads
                from the right, so 01 sits at the right edge. */}
            <div className="relative mt-10 md:mt-14">
              <div
                className="hidden md:block absolute top-7 inset-x-0 h-px bg-border"
                aria-hidden="true"
              />
              <ol className="relative grid gap-10 md:grid-cols-3 md:gap-12">
                {nextSteps.map((step, i) => (
                  <li key={step.n} className="min-w-0">
                    <Reveal delay={i * 110} className="flex flex-col items-start text-right">
                      <span
                        aria-hidden="true"
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/45 bg-background font-display text-[22px] text-primary"
                      >
                        {step.n}
                      </span>
                      <h3 className="mt-6 font-display font-normal text-[22px] leading-snug text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-[18px] leading-relaxed text-muted-foreground">
                        {step.line}
                      </p>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>

            <Reveal className="mt-12 md:mt-16 border-t border-border pt-9 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[20px] leading-relaxed text-foreground max-w-xl text-right">
                רוצים להקדים את השלב הראשון? השאלון החכם אוסף את הפרטים בשתי דקות, ואנחנו כבר מגיעים
                לשיחה עם רעיונות מתאימים.
              </p>

              <div className="flex flex-wrap gap-4 sm:shrink-0">
                <ShineButton to="/questionnaire">
                  לשאלון החכם
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                </ShineButton>
                <ShineButton to="/collections">
                  לצפייה בקולקציות
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                </ShineButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
