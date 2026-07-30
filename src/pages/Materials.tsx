import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import MaterialBand from "@/components/materials/MaterialBand";
import { materials } from "@/data/materials";

/**
 * The materials index.
 *
 * Charcoal end to end — the same inversion the materials rail uses on the home
 * screen, where the one dark section is what makes the whole page feel
 * expensive. What used to be a 2-up grid of small cards is now one full-width
 * band per material, photograph alternating sides down the page, each band lit
 * from behind by its own colour so the dark canvas has depth rather than four
 * panels floating on it.
 *
 * The page ends on a hairline: charcoal content running into a charcoal footer
 * had no seam at all, and the rule is what tells you the page finished.
 */
const MaterialsPage = () => {
  return (
    <Layout>
      <SEO
        title="חומרים | בדי Sunbrella, אלומיניום ושיש גרניט פורצלן | Aluma"
        description="החומרים שמהם עשויים מוצרי Aluma: בדי Sunbrella עמידים ל־UV, אלומיניום פרימיום בציפוי אבקה ושיש גרניט פורצלן בעיבוד יד, לעמידות יוקרה לאורך שנים."
        path="/materials"
      />

      <PageHero title="חומרים" dark />

      <section className="pt-10 pb-16 md:pt-14 md:pb-24 bg-foreground border-b border-background/15">
        <div className="container-luxury">
          {/* INTRO — heading right-anchored, then the argument in columns
              underneath.

              The obvious layout here was heading on the right, prose beside it
              on the left. It left a 500px column of nothing under a two-line
              heading, which is precisely the dead space the client keeps
              rejecting. Running the prose across the full width in columns
              fills the opening instead, and in RTL the first paragraph lands in
              the RIGHT column, so it still reads in order. At md the closing
              paragraph spans both columns rather than leaving half a row
              empty. */}
          <Reveal>
            <div className="text-right">
              <SectionHeading light align="start">
                איך אנחנו בוחרים חומרים
              </SectionHeading>
              <div
                className="w-20 h-[2px] bg-background/40 mt-5"
                aria-hidden="true"
              />

              <div className="grid gap-x-10 gap-y-6 lg:gap-x-14 md:grid-cols-2 lg:grid-cols-3 mt-8 md:mt-10">
                <p className="text-lede leading-relaxed text-background/80 text-pretty">
                  רהיט חוץ לא נמדד ביום שהוא מגיע לחצר, אלא בעונות שבאות אחריו.
                  השמש, הלחות, רסס המלח והגשם פועלים עליו כל השנה בלי הפסקה,
                  ולכן ההחלטה הראשונה בכל פריט שאנחנו מייצרים היא לא הצורה, אלא
                  החומר.
                </p>
                <p className="text-lede leading-relaxed text-background/80 text-pretty">
                  אנחנו עובדים עם מספר מצומצם של חומרים שהוכיחו את עצמם בתנאי
                  חוץ: פרופילי אלומיניום בציפוי אבקה תרמי, שלא מחלידים ולא
                  דורשים תחזוקה; בדי Sunbrella אקריליים שנצבעים בצבע מלא, כך
                  שהגוון הוא חלק מהסיב; לוחות גרניט פורצלן שלא סופגים נוזלים ולא
                  דורשים איטום; ו־PolyStone, חומר מרוכב בגימור אבן שמאפשר צורות
                  פיסוליות במשקל נמוך.
                </p>
                <p className="text-lede leading-relaxed text-background/80 text-pretty md:col-span-2 lg:col-span-1">
                  אף חומר לא נכנס לכאן במקרה, והצירוף ביניהם הוא מה שמאפשר לרהיט
                  להישאר בחוץ כל השנה: בלי לפרק, בלי לאחסן ובלי לחדש. התחזוקה
                  מסתכמת בשטיפה מדי פעם, והמראה כמעט לא משתנה עם השנים.
                </p>
              </div>
            </div>
          </Reveal>

          <div
            className="h-px bg-background/10 mt-12 md:mt-14"
            aria-hidden="true"
          />

          {/* THE BANDS
              Held to roughly 70% of the container's width rather than scaled
              down: the type on these cards is pinned at 26/20/18 and shrinking
              the whole band would drag it under the site's 18px floor. Narrowing
              the column makes the cards read as compact while the text stays
              exactly where it was set. */}
          <div className="mt-12 md:mt-16 space-y-14 md:space-y-20 max-w-[920px] mx-auto">
            {materials.map((m, i) => (
              <Reveal key={m.slug}>
                <MaterialBand material={m} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MaterialsPage;
