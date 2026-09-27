import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import Contact from "@/components/Contact";
import ShowroomBand from "@/components/contact/ShowroomBand";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

type Faq = { id: string; question: string; answer: string; category: string };

/**
 * The questions the page ships with, used until the database answers.
 *
 * The client asked to remove "how much does outdoor furniture cost" and to be
 * able to edit the rest himself, so the real source is the site_faqs table and
 * this is only the offline fallback — a first paint with content beats a first
 * paint with a spinner, and a failed query leaves a usable page rather than an
 * empty one.
 */
const FALLBACK: Faq[] = [
  {
    id: "lead",
    category: "רכישה ואספקה",
    question: "כמה זמן לוקח לקבל את ההזמנה?",
    answer:
      "זמן האספקה הממוצע נע בין 5 ל-10 שבועות, בהתאם לזמינות הקולקציה ולהיקף ההזמנה.",
  },
  {
    id: "delivery",
    category: "רכישה ואספקה",
    question: "האם יש הובלה והרכבה?",
    answer:
      "הריהוט מסופק לבית הלקוח בתיאום מראש, ומורכב על ידי צוות מקצועי ומנוסה.",
  },
  {
    id: "outdoor",
    category: "חומרים ועמידות",
    question: "האם הריהוט עמיד לתנאי חוץ?",
    answer:
      "כן. שלדת אלומיניום בצביעה בתנור, בדי Sunbrella עמידים ל-UV ולמים, ומשטחי שיש גרניט פורצלן — כל פריט מיועד לשימוש חיצוני בכל עונות השנה.",
  },
  {
    id: "care",
    category: "חומרים ועמידות",
    question: "איך מתחזקים את הריהוט?",
    answer:
      "תחזוקה מינימלית: ניקוי תקופתי במים ובחומרי ניקוי עדינים ישמור על המראה לאורך שנים.",
  },
  {
    id: "warranty",
    category: "אחריות ושירות",
    question: "מה כוללת האחריות?",
    answer:
      "אנו מעניקים אחריות בהתאם לסוג המוצר והרכיבים ממנו הוא מיוצר, וצוות השירות זמין גם לאחר האספקה.",
  },
  {
    id: "showroom",
    category: "אחריות ושירות",
    question: "האם יש אולם תצוגה?",
    answer: "אולם התצוגה שלנו ברחוב התמר 78 ביציץ פתוח בתיאום מראש.",
  },
];

/**
 * One question row. The whole row is the button; the plus sits at the leading
 * edge (the right, in Hebrew) and rotates into a ×. A plus is direction-neutral,
 * which is exactly why it beats a chevron here — a start-pointing chevron has
 * to mirror in RTL and someone always forgets.
 */
const FaqRow = ({
  q,
  a,
  id,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  id: string;
  open: boolean;
  onToggle: () => void;
}) => (
  <div className="border-b border-foreground/10">
    <button
      type="button"
      onClick={onToggle}
      id={`faq-q-${id}`}
      aria-expanded={open}
      aria-controls={`faq-a-${id}`}
      className="group flex w-full items-start gap-5 py-6 text-start hover:opacity-70 transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <Plus
        aria-hidden="true"
        className={`mt-1 w-[18px] h-[18px] shrink-0 text-foreground/40 group-hover:text-foreground transition-[transform,color] duration-300 ease-in-out ${
          open ? "rotate-45" : ""
        }`}
        strokeWidth={2}
      />
      <span
        dir="auto"
        className="text-body font-medium leading-[1.35] text-foreground"
      >
        {q}
      </span>
    </button>

    {/* 0fr→1fr is the modern height-auto animation — no measuring, no maxHeight
        guesses that clip long answers. */}
    <div
      id={`faq-a-${id}`}
      role="region"
      aria-labelledby={`faq-q-${id}`}
      // Clipped to zero height is not hidden. Grid-collapsed content stays in
      // the accessibility tree — that is exactly why `sr-only` works — so a
      // screen reader read all six questions AND all six answers in one run
      // while every button announced itself as collapsed. `hidden` would kill
      // the open animation; aria-hidden removes it from the tree and leaves
      // the animation alone, and the panel holds no focusable content.
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <p
          dir="auto"
          className={`ps-10 pb-8 pt-1 max-w-[62ch] text-small text-foreground-soft transition-opacity duration-300 ${
            open ? "opacity-100 delay-75" : "opacity-0"
          }`}
        >
          {a}
        </p>
      </div>
    </div>
  </div>
);

/**
 * Q&A, on Apple's marketing-FAQ pattern: one flat accordion in a 720px
 * measure, quiet category labels as separators rather than tabs or a sidebar,
 * multiple rows allowed open at once, and no search — Apple runs 25 questions
 * in a flat list without one, and this page has six. The previous version's
 * scroll-spy topic index was a support-portal device the content never needed.
 */
const FAQPage = () => {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [faqs, setFaqs] = useState<Faq[]>(FALLBACK);
  const { to } = useLocalizedPath();
  const { t } = useTranslation("faq");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("site_faqs")
          .select("id, question, answer, category")
          .eq("published", true)
          .order("sort_order", { ascending: true });
        // Only take over from the shipped copy if the table actually has rows.
        if (!cancelled && data && data.length > 0) setFaqs(data as Faq[]);
      } catch {
        // Keep the fallback.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Group in encounter order so the admin's sort_order decides both the
  // question order and the order the category headings appear in.
  const grouped = faqs.reduce<{ category: string; items: Faq[] }[]>(
    (acc, f) => {
      const bucket = acc.find((g) => g.category === f.category);
      if (bucket) bucket.items.push(f);
      else acc.push({ category: f.category, items: [f] });
      return acc;
    },
    [],
  );

  // Regenerated from the catalog in the ACTIVE language, so the structured
  // data always matches what the page shows.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

      {/* The page's title sits where every other interior page puts its
          own — the shared header — and says what the page is. It was "שאלות?
          תשובות." in a heavier weight, with a subtitle and a "write to us ↓"
          link under it, all set in the narrow column below instead. */}
      <PageHero title={t("title")} />

      <section className="bg-background pb-20 md:pb-28">
        {/* The questions keep their reading width, but start from the same
            edge as the title rather than floating in the middle of the page. */}
        <div className="container-luxury">
          <div className="max-w-[720px]">
            {grouped.map((group, gi) => (
              <Reveal
                key={group.category}
                className={gi > 0 ? "mt-14" : undefined}
              >
                <section aria-label={group.category}>
                  {/* A label, not a tab. Hebrew has no uppercase, so size and
                        colour do that job instead. */}
                  <h2
                    dir="auto"
                    className="mb-4 text-label text-muted-foreground text-start"
                  >
                    {group.category}
                  </h2>
                  {group.items.map((f) => (
                    <FaqRow
                      key={f.id}
                      id={f.id}
                      q={f.question}
                      a={f.answer}
                      open={open.has(f.id)}
                      onToggle={() => toggle(f.id)}
                    />
                  ))}
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Contact />

      <ShowroomBand />
    </Layout>
  );
};

export default FAQPage;
