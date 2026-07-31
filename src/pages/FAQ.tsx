import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { useLocalizedPath } from "@/lib/useLocalizedPath";

interface FaqItem {
  id: string;
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  label: string;
  items: FaqItem[];
}

/**
 * The whole page is driven by this one array — the list and the FAQPage
 * JSON-LD both read from it, so they can't drift apart. Every question and
 * answer is the client's existing copy.
 */
const categories: FaqCategory[] = [
  {
    id: "faq-buy",
    label: "רכישה ואספקה",
    items: [
      {
        id: "price",
        q: "כמה עולה ריהוט חוץ?",
        a: "מחירי ריהוט החוץ משתנים בהתאם לקולקציה, לגודל הסט ולפריטים הכלולים בו. אנו מציעים מגוון פתרונות המתאימים לצרכים ולסגנונות שונים, תוך הקפדה על איכות גבוהה ותמורה מצוינת לאורך זמן.",
      },
      {
        id: "lead-time",
        q: "כמה זמן לוקח לקבל את ההזמנה?",
        a: "זמן האספקה הממוצע נע בין 5 ל-10 שבועות, בהתאם לזמינות הקולקציה ולהיקף ההזמנה. כבר במעמד הרכישה תקבלו הערכת זמן מסודרת, ואנו נדאג לעדכן אתכם לאורך כל התהליך – משלב ההזמנה ועד להגעת הריהוט לביתכם.",
      },
      {
        id: "delivery",
        q: "האם יש הובלה והרכבה?",
        a: "הריהוט מסופק לבית הלקוח בתיאום מראש, ומורכב על ידי צוות מקצועי ומנוסה. אנו מקפידים על הובלה בטוחה, הרכבה מדויקת ופינוי האריזות, כדי שתוכלו ליהנות מחוויית רכישה מושלמת.",
      },
    ],
  },
  {
    id: "faq-materials",
    label: "חומרים ועמידות",
    items: [
      {
        id: "outdoor",
        q: "האם הריהוט עמיד לתנאי חוץ?",
        a: "ריהוט החוץ שלנו מיוצר מחומרים שנבחרו במיוחד לתנאי האקלים בישראל: שלדת אלומיניום איכותית בצביעה בתנור, בדי Sunbrella עמידים בפני מים וקרינת UV, משטחי שיש גרניט פורצלן השומרים על מראה יוקרתי לאורך שנים, וכן משטחי Polystone איכותיים המשלבים עמידות גבוהה לצד מראה מודרני ואלגנטי. כל פריט מיועד לשימוש חיצוני בכל עונות השנה.",
      },
      {
        id: "quality",
        q: "מה איכות החומרים?",
        a: "כל קולקציה נבחרת בקפידה מתוך דגש על איכות, נוחות ועמידות. השילוב בין שלדת האלומיניום, בדי הפרימיום ומשטחי הגרניט פורצלן וה-Polystone יוצר ריהוט חוץ יוקרתי המיועד לשנים רבות של שימוש ואירוח.",
      },
      {
        id: "care",
        q: "איך מתחזקים את הריהוט?",
        a: "ריהוט החוץ שלנו תוכנן לדרוש תחזוקה מינימלית. ניקוי תקופתי של השלדה, הבדים והמשטחים באמצעות מים וחומרי ניקוי עדינים יסייע לשמור על מראה נקי ומרשים לאורך שנים.",
      },
    ],
  },
  {
    id: "faq-service",
    label: "אחריות ושירות",
    items: [
      {
        id: "warranty",
        q: "מה כוללת האחריות?",
        a: "אנו מעניקים אחריות על ריהוט החוץ בהתאם לסוג המוצר והרכיבים ממנו הוא מיוצר. האחריות נועדה להבטיח לכם שקט נפשי וביטחון ברכישה, וצוות השירות שלנו זמין לכל שאלה גם לאחר האספקה.",
      },
      {
        id: "showroom",
        q: "האם יש אולם תצוגה?",
        a: "אולם התצוגה שלנו, הממוקם ברחוב התמר 78, יציץ, פתוח בתיאום מראש. במקום תוכלו להתרשם ממגוון הקולקציות, להרגיש את איכות החומרים מקרוב ולקבל ייעוץ מקצועי בבחירת ריהוט החוץ המתאים ביותר עבורכם.",
      },
    ],
  },
];

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

/**
 * One question row. The whole row is the button; the plus sits at the leading
 * edge (the right, in Hebrew) and rotates into a ×. A plus is direction-neutral,
 * which is exactly why it beats a chevron here — a start-pointing chevron has
 * to mirror in RTL and someone always forgets.
 */
const FaqRow = ({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) => (
  <div className="border-b border-foreground/10">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={`faq-a-${item.id}`}
      className="group flex w-full items-start gap-5 py-6 text-start hover:opacity-70 transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <Plus
        aria-hidden="true"
        className={`mt-1 w-5 h-5 shrink-0 text-primary transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "rotate-45" : ""
        }`}
        strokeWidth={2}
      />
      <span className="text-[19px] md:text-[21px] font-medium leading-[1.35] text-foreground">
        {item.q}
      </span>
    </button>

    {/* 0fr→1fr is the modern height-auto animation — no measuring, no maxHeight
        guesses that clip long answers. */}
    <div
      id={`faq-a-${item.id}`}
      role="region"
      className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <p
          className={`ps-10 pb-8 pt-1 max-w-[62ch] text-[16px] md:text-[17px] leading-[1.6] text-foreground-soft transition-opacity duration-300 ${
            open ? "opacity-100 delay-75" : "opacity-0"
          }`}
        >
          {item.a}
        </p>
      </div>
    </div>
  </div>
);

/**
 * Q&A, on Apple's marketing-FAQ pattern: one flat accordion in a 720px
 * measure, quiet category labels as separators rather than tabs or a sidebar,
 * multiple rows allowed open at once, and no search — Apple runs 25 questions
 * in a flat list without one, and this page has nine. The previous version's
 * scroll-spy topic index was a support-portal device the content never needed.
 */
const FAQPage = () => {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const { to } = useLocalizedPath();

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <Layout>
      <SEO
        title="שאלות ותשובות | Aluma"
        description="אספקה, חומרים, אחריות ותחזוקה — התשובות לשאלות שאנחנו נשאלים הכי הרבה על ריהוט החוץ של Aluma."
        path="/faq"
        jsonLd={faqSchema}
      />

      <section className="pt-40 pb-20 md:pt-48 md:pb-28 bg-background">
        <div className="mx-auto max-w-[720px] px-6">
          <Reveal>
            {/* Apple's two-beat heading convention, not the word "FAQ". */}
            <h1 className="font-display font-semibold text-[40px] md:text-[56px] leading-[1.08] text-foreground text-right">
              שאלות? תשובות.
            </h1>
            <p className="mt-4 max-w-[46ch] text-[17px] md:text-[19px] leading-relaxed text-foreground-soft text-right">
              כל מה שאנחנו נשאלים לפני שמזמינים — ומה שכדאי לדעת אחרי.
            </p>
          </Reveal>

          <div className="mt-12 md:mt-16">
            {categories.map((cat) => (
              <Reveal key={cat.id}>
                <section aria-labelledby={cat.id}>
                  {/* A label, not a tab: small, tracked, terracotta. Hebrew has
                      no uppercase, so size + color + tracking do that job. */}
                  <h2
                    id={cat.id}
                    className="mt-14 first:mt-0 mb-4 text-[13px] font-semibold tracking-[0.08em] text-primary text-right"
                  >
                    {cat.label}
                  </h2>
                  {cat.items.map((item) => (
                    <FaqRow
                      key={item.id}
                      item={item}
                      open={open.has(item.id)}
                      onToggle={() => toggle(item.id)}
                    />
                  ))}
                </section>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-14 text-[17px] leading-relaxed text-foreground-soft text-right">
              לא מצאתם את התשובה?{" "}
              <Link
                to={to("/contact")}
                className="text-primary decoration-1 underline-offset-4 hover:underline"
              >
                דברו איתנו
              </Link>
              {" "}— עונים תוך יום עסקים.
            </p>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default FAQPage;
