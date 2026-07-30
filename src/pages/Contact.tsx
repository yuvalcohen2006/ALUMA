import { Link } from "react-router-dom";
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

            {/* The rail: numerals threaded on a hairline. In RTL it reads from
                the right, so 01 sits at the right edge.

                The connector belongs to each numeral rather than to the row: a
                single line across the whole width carried on past 03 and died
                at the container edge, a tail pointing at nothing. Each segment
                now runs from its own circle (start-14 = the circle's width) to
                exactly the right edge of the next one (end -3rem = the md
                column gap), so the rail stops where the steps stop. */}
            <div className="mt-10 md:mt-14">
              <ol className="grid gap-10 md:grid-cols-3 md:gap-12">
                {nextSteps.map((step, i) => (
                  <li key={step.n} className="relative min-w-0">
                    <Reveal delay={i * 110} className="flex flex-col items-start text-right">
                      {i < nextSteps.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="hidden md:block absolute top-7 start-14 end-[-3rem] h-px bg-border"
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/45 bg-background font-display text-card-title leading-none tabular-nums text-primary"
                      >
                        {step.n}
                      </span>
                      <h3 className="mt-6 font-display font-normal text-card-title leading-snug text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-meta leading-relaxed text-muted-foreground">
                        {step.line}
                      </p>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>

            <Reveal className="mt-12 md:mt-16 border-t border-border pt-9 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lede leading-relaxed text-foreground max-w-xl text-right">
                רוצים להקדים את השלב הראשון? השאלון החכם אוסף את הפרטים בשתי דקות, ואנחנו כבר מגיעים
                לשיחה עם רעיונות מתאימים.
              </p>

              {/* Two identical buttons gave the row no hierarchy, and only one
                  of them answers the sentence beside it. The questionnaire
                  keeps the button; browsing the collections steps back to the
                  quiet link grammar the rest of the site uses, with the rule
                  growing from the right — the RTL start. */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-5 sm:shrink-0">
                <ShineButton to="/questionnaire">
                  לשאלון החכם
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                </ShineButton>

                <Link to="/collections" className="group inline-block">
                  <span className="flex items-center gap-2 text-meta text-accent">
                    לצפייה בקולקציות
                    <ArrowLeft
                      className="w-[18px] h-[18px] transition-transform duration-300 ease-out group-hover:-translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className="block h-px w-0 bg-accent/70 transition-[width] duration-500 ease-out group-hover:w-full"
                  />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
