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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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
          <div className="grid gap-8 lg:gap-14 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] max-w-6xl mx-auto">
            {/* First DOM child → right column in RTL. Sticky from lg up; on
                narrow screens it collapses into a swipeable row of chips. */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[14px] border border-border bg-secondary/30 p-5 md:p-6">
                <h2 className="font-display font-normal text-[22px] text-foreground text-right">
                  נושאים
                </h2>
                <div className="w-16 h-[2px] bg-primary/55 mt-4" aria-hidden="true" />

                <nav
                  aria-label="ניווט בין נושאי השאלות"
                  className="rail-scroll mt-5 -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 md:-mx-6 md:px-6 lg:mx-0 lg:mt-6 lg:flex-col lg:gap-2 lg:overflow-x-visible lg:px-0 lg:pb-0"
                >
                  {categories.map((cat) => {
                    const isActive = activeCat === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => goToCategory(cat.id)}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "shrink-0 lg:shrink flex items-center gap-3 rounded-[10px] border px-4 py-3 text-right transition-all duration-300",
                          isActive
                            ? "border-primary/60 bg-background shadow-soft text-foreground"
                            : "border-transparent text-foreground-soft hover:border-border hover:bg-background/70 hover:text-foreground",
                        )}
                      >
                        <cat.Icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors duration-300",
                            isActive ? "text-accent" : "text-primary/70",
                          )}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <span className="text-[18px] whitespace-nowrap lg:whitespace-normal">
                          {cat.label}
                        </span>
                        <span className="ms-auto hidden lg:block text-[18px] text-muted-foreground">
                          {cat.items.length}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                <p className="hidden lg:block mt-6 pt-5 border-t border-border/70 text-[18px] text-muted-foreground text-right">
                  {totalQuestions} שאלות, {topicsLabel}.
                </p>
              </div>
            </aside>

            {/* Answers column */}
            <div className="space-y-14 md:space-y-20">
              {categories.map((cat, ci) => (
                <section
                  key={cat.id}
                  id={cat.id}
                  aria-labelledby={`${cat.id}-title`}
                  className="scroll-mt-32"
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
