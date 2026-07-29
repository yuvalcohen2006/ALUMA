import { useEffect, useState } from "react";
import {
  Truck,
  Sun,
  Gem,
  ShieldCheck,
  Tag,
  Wrench,
  Sparkles,
  Eye,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import TopicIndex from "@/components/faq/TopicIndex";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface FaqItem {
  /** Stable ASCII id — used as the accordion value. */
  id: string;
  q: string;
  a: string;
  Icon: LucideIcon;
}

interface FaqCategory {
  /** ASCII id — the scroll target for the index on the right. */
  id: string;
  label: string;
  blurb: string;
  Icon: LucideIcon;
  items: FaqItem[];
}

/**
 * The whole page is driven by this one array: the index panel, the three
 * accordion groups and the FAQPage JSON-LD all read from it, so nothing can
 * drift out of sync. Every question and answer here is the client's existing
 * copy, only regrouped by subject.
 */
const categories: FaqCategory[] = [
  {
    id: "faq-buy",
    label: "רכישה ואספקה",
    blurb:
      "כמה זה עולה, מתי זה מגיע ומי מרכיב. כל מה שקורה מרגע ההזמנה ועד שהריהוט עומד אצלכם בחוץ.",
    Icon: Truck,
    items: [
      {
        id: "price",
        q: "כמה עולה ריהוט חוץ?",
        a: "מחירי ריהוט החוץ משתנים בהתאם לקולקציה, לגודל הסט ולפריטים הכלולים בו. אנו מציעים מגוון פתרונות המתאימים לצרכים ולסגנונות שונים, תוך הקפדה על איכות גבוהה ותמורה מצוינת לאורך זמן.",
        Icon: Tag,
      },
      {
        id: "lead-time",
        q: "כמה זמן לוקח לקבל את ההזמנה?",
        a: "זמן האספקה הממוצע נע בין 5 ל-10 שבועות, בהתאם לזמינות הקולקציה ולהיקף ההזמנה. כבר במעמד הרכישה תקבלו הערכת זמן מסודרת, ואנו נדאג לעדכן אתכם לאורך כל התהליך – משלב ההזמנה ועד להגעת הריהוט לביתכם.",
        Icon: Truck,
      },
      {
        id: "delivery",
        q: "האם יש הובלה והרכבה?",
        a: "הריהוט מסופק לבית הלקוח בתיאום מראש, ומורכב על ידי צוות מקצועי ומנוסה. אנו מקפידים על הובלה בטוחה, הרכבה מדויקת ופינוי האריזות, כדי שתוכלו ליהנות מחוויית רכישה מושלמת.",
        Icon: Wrench,
      },
    ],
  },
  {
    id: "faq-materials",
    label: "חומרים ועמידות",
    blurb:
      "מה עומד מאחורי כל פריט, מהשלדה ועד הבד, ואיך שומרים על המראה הזה גם אחרי שנים של שמש, גשם ומלח.",
    Icon: Gem,
    items: [
      {
        id: "outdoor",
        q: "האם הריהוט עמיד לתנאי חוץ?",
        a: "ריהוט החוץ שלנו מיוצר מחומרים שנבחרו במיוחד לתנאי האקלים בישראל: שלדת אלומיניום איכותית בצביעה בתנור, בדי Sunbrella עמידים בפני מים וקרינת UV, משטחי שיש גרניט פורצלן השומרים על מראה יוקרתי לאורך שנים, וכן משטחי Polystone איכותיים המשלבים עמידות גבוהה לצד מראה מודרני ואלגנטי. כל פריט מיועד לשימוש חיצוני בכל עונות השנה.",
        Icon: Sun,
      },
      {
        id: "quality",
        q: "מה איכות החומרים?",
        a: "כל קולקציה נבחרת בקפידה מתוך דגש על איכות, נוחות ועמידות. השילוב בין שלדת האלומיניום, בדי הפרימיום ומשטחי הגרניט פורצלן וה-Polystone יוצר ריהוט חוץ יוקרתי המיועד לשנים רבות של שימוש ואירוח.",
        Icon: Gem,
      },
      {
        id: "care",
        q: "איך מתחזקים את הריהוט?",
        a: "ריהוט החוץ שלנו תוכנן לדרוש תחזוקה מינימלית. ניקוי תקופתי של השלדה, הבדים והמשטחים באמצעות מים וחומרי ניקוי עדינים יסייע לשמור על מראה נקי ומרשים לאורך שנים.",
        Icon: Sparkles,
      },
    ],
  },
  {
    id: "faq-service",
    label: "אחריות ושירות",
    blurb:
      "מה מכסה האחריות, ואיפה אפשר לראות את הריהוט מקרוב, לגעת בבדים ולהתייעץ לפני שמחליטים.",
    Icon: ShieldCheck,
    items: [
      {
        id: "warranty",
        q: "מה כוללת האחריות?",
        a: "אנו מעניקים אחריות על ריהוט החוץ בהתאם לסוג המוצר והרכיבים ממנו הוא מיוצר. האחריות נועדה להבטיח לכם שקט נפשי וביטחון ברכישה, וצוות השירות שלנו זמין לכל שאלה גם לאחר האספקה.",
        Icon: ShieldCheck,
      },
      {
        id: "showroom",
        q: "האם יש אולם תצוגה?",
        a: "אולם התצוגה שלנו, הממוקם ברחוב התמר 78, יציץ, פתוח בתיאום מראש. במקום תוכלו להתרשם ממגוון הקולקציות, להרגיש את איכות החומרים מקרוב ולקבל ייעוץ מקצועי בבחירת ריהוט החוץ המתאים ביותר עבורכם.",
        Icon: Eye,
      },
    ],
  },
];

// Regenerated from the array above, so the structured data can never fall out of
// step with what the page actually shows.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: categories.flatMap((c) =>
    c.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  ),
};

const totalQuestions = categories.reduce((n, c) => n + c.items.length, 0);

// The index reads the same array, so a new topic appears in it for free.
const indexEntries = categories.map((c) => ({
  id: c.id,
  label: c.label,
  count: c.items.length,
}));

// Hebrew counts the noun, not the digit — so the footnote spells the number of
// topics out instead of hard-coding "שלושה" and drifting the day a topic is added.
const HE_TOPIC_COUNT = [
  "",
  "נושא אחד",
  "שני נושאים",
  "שלושה נושאים",
  "ארבעה נושאים",
  "חמישה נושאים",
  "שישה נושאים",
];
const topicsLabel = HE_TOPIC_COUNT[categories.length] || `${categories.length} נושאים`;

const FAQPage = () => {
  const [activeCat, setActiveCat] = useState(categories[0].id);

  // Scroll-spy for the index on the right. The top margin clears the fixed
  // header; the bottom one keeps the highlight on whichever group owns the
  // upper half of the screen rather than flipping at the very bottom edge.
  useEffect(() => {
    const els = categories
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length || typeof IntersectionObserver === "undefined") return;

    // An IntersectionObserver callback only carries the entries that CHANGED,
    // never the full set — so the visible groups have to be accumulated across
    // callbacks. Reading `entries` alone leaves the index stuck on a group that
    // has already scrolled away (its "left the band" callback carries no
    // intersecting entry at all, so nothing gets set).
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        });
        // `categories` is in document order, so the first hit is the topmost
        // group currently inside the reading band.
        const top = categories.find((c) => visible.has(c.id));
        if (top) setActiveCat(top.id);
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goToCategory = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // html carries scroll-behavior:smooth globally, so "instant" is the only way
    // to honour a reduced-motion preference here.
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
    // Focus follows the jump (each group carries tabIndex={-1} as a programmatic
    // focus target), so a keyboard user carries on tabbing from the group they
    // picked instead of from the index. preventScroll keeps this call from
    // re-scrolling and cancelling the smooth animation above.
    el.focus({ preventScroll: true });
    setActiveCat(id);
  };

  return (
    <Layout>
      <SEO
        title="שאלות ותשובות | Aluma, ריהוט חוץ יוקרתי"
        description="שאלות נפוצות על מוצרי Aluma: עמידות החומרים, זמני אספקה, התאמה אישית, אחריות וטיפול בריהוט חוץ, כל מה שחשוב לדעת לפני שמזמינים."
        path="/faq"
        jsonLd={faqSchema}
      />

      <PageHero
        title="שאלות ותשובות"
        subtitle="ריכזנו כאן את מה שנשאלנו לאורך השנים, מסודר לפי נושא. בחרו נושא מהרשימה או פשוט גללו למטה."
      />

      {/* ===== Index on the right, answers on the left ===== */}
      <section className="pt-10 pb-16 md:pt-14 md:pb-24 bg-background">
        <div className="container-luxury">
          {/* 17rem index track. The gutter rule below is centred by gap-12 +
              ps-12 on the answers column, which is independent of this width —
              the extra rem goes to the index leaders so they read as rules
              rather than as 28px stubs behind the longest topic label. */}
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] max-w-6xl mx-auto">
            {/* First DOM child → right column in RTL. Sticky from lg up; below
                that it simply sits above the answers as the same index column.
                No closing border here — the last index line already ends in a
                hairline, and a second one 28px under it just looked doubled. */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <TopicIndex
                entries={indexEntries}
                activeId={activeCat}
                onSelect={goToCategory}
                footnote={`${totalQuestions} שאלות, ${topicsLabel}.`}
              />
            </aside>

            {/* Answers column. The gutter rule sits on this column rather than
                between the grid tracks so it runs the full height of the
                answers, the way the gutter rule on a printed index page does.
                It fades out near the bottom instead of stopping dead under the
                last accordion. */}
            <div className="relative lg:ps-12">
              <span
                aria-hidden="true"
                className="absolute inset-y-0 start-0 hidden w-px lg:block"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, hsl(var(--border)) 0%, hsl(var(--border)) 62%, transparent 100%)",
                }}
              />

              <div className="space-y-14 md:space-y-20">
                {categories.map((cat, ci) => (
                  <section
                    key={cat.id}
                    id={cat.id}
                    aria-labelledby={`${cat.id}-title`}
                    // tabIndex/-1 + focus:outline-none: a landing target for
                    // goToCategory's focus move, never a tab stop of its own
                    // and never a stray focus ring.
                    tabIndex={-1}
                    className="scroll-mt-32 focus:outline-none"
                  >
                    <Reveal>
                      <div className="flex items-start gap-4">
                        <span
                          className="shrink-0 mt-1 flex h-12 w-12 items-center justify-center rounded-[10px] border border-primary/25 bg-secondary/60 text-accent"
                          aria-hidden="true"
                        >
                          <cat.Icon className="h-6 w-6" strokeWidth={1.5} />
                        </span>
                        <SectionHeading
                          align="start"
                          className="min-w-0"
                          subtitle={cat.blurb}
                        >
                          <span id={`${cat.id}-title`}>{cat.label}</span>
                        </SectionHeading>
                      </div>
                    </Reveal>

                    <Reveal delay={90}>
                      <Accordion
                        type="single"
                        collapsible
                        defaultValue={ci === 0 ? cat.items[0].id : undefined}
                        className="mt-7 space-y-3"
                      >
                        {cat.items.map((item) => (
                          <AccordionItem
                            key={item.id}
                            value={item.id}
                            className="rounded-[14px] border border-border bg-secondary/20 px-5 md:px-6 transition-all duration-300 hover:border-primary/60 data-[state=open]:border-primary/60 data-[state=open]:bg-secondary/40 data-[state=open]:shadow-soft"
                          >
                            {/* RTL: the trigger's children sit at the right edge and
                                justify-between pushes the chevron to the far left.
                                items-start + the 5px nudge keep the topic mark and
                                the chevron on the FIRST line — every question wraps
                                to two lines at 375px, and items-center would leave
                                both floating in the middle of the block. */}
                            <AccordionTrigger className="items-start gap-4 md:gap-6 py-5 md:py-6 text-[22px] font-display font-normal leading-snug text-right text-foreground hover:no-underline hover:text-accent [&>svg]:mt-[5px] [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-accent">
                              <span className="flex min-w-0 items-start gap-3">
                                <item.Icon
                                  className="mt-[5px] h-5 w-5 shrink-0 text-accent"
                                  strokeWidth={1.5}
                                  aria-hidden="true"
                                />
                                {item.q}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="ps-8 pb-6 pt-0 text-[20px] leading-relaxed text-right">
                              <p className="text-[20px] leading-relaxed text-foreground text-pretty">
                                {item.a}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </Reveal>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== The one dark band: still stuck? talk to us ===== */}
      <section className="py-16 md:py-24 bg-foreground">
        <div className="container-luxury">
          <Reveal className="max-w-3xl mx-auto flex flex-col items-center">
            <SectionHeading
              light
              align="center"
              subtitle="צוות אלומה כאן בשבילכם. ספרו לנו על החלל שלכם ועל מה שחשוב לכם, ונחזור אליכם עם מענה אישי."
            >
              לא מצאתם תשובה?
            </SectionHeading>

            <div className="mt-9 flex justify-center">
              <ShineButton to="/contact" invert>
                דברו איתנו
                <ArrowLeft className="w-4 h-4" />
              </ShineButton>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default FAQPage;
