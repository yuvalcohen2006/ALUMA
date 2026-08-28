import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import Contact from "@/components/Contact";
import ShowroomBand from "@/components/contact/ShowroomBand";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useSiteText } from "@/hooks/useSiteText";

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
  { id: "lead", category: "רכישה ואספקה", question: "כמה זמן לוקח לקבל את ההזמנה?", answer: "זמן האספקה הממוצע נע בין 5 ל-10 שבועות, בהתאם לזמינות הקולקציה ולהיקף ההזמנה." },
  { id: "delivery", category: "רכישה ואספקה", question: "האם יש הובלה והרכבה?", answer: "הריהוט מסופק לבית הלקוח בתיאום מראש, ומורכב על ידי צוות מקצועי ומנוסה." },
  { id: "outdoor", category: "חומרים ועמידות", question: "האם הריהוט עמיד לתנאי חוץ?", answer: "כן. שלדת אלומיניום בצביעה בתנור, בדי Sunbrella עמידים ל-UV ולמים, ומשטחי שיש גרניט פורצלן — כל פריט מיועד לשימוש חיצוני בכל עונות השנה." },
  { id: "care", category: "חומרים ועמידות", question: "איך מתחזקים את הריהוט?", answer: "תחזוקה מינימלית: ניקוי תקופתי במים ובחומרי ניקוי עדינים ישמור על המראה לאורך שנים." },
  { id: "warranty", category: "אחריות ושירות", question: "מה כוללת האחריות?", answer: "אנו מעניקים אחריות בהתאם לסוג המוצר והרכיבים ממנו הוא מיוצר, וצוות השירות זמין גם לאחר האספקה." },
  { id: "showroom", category: "אחריות ושירות", question: "האם יש אולם תצוגה?", answer: "אולם התצוגה שלנו ברחוב התמר 78 ביציץ פתוח בתיאום מראש." },
];



/**
 * One question row. The whole row is the button; the plus sits at the leading
 * edge (the right, in Hebrew) and rotates into a ×. A plus is direction-neutral,
 * which is exactly why it beats a chevron here — a start-pointing chevron has
 * to mirror in RTL and someone always forgets.
 */
const FaqRow = ({ q, a, id, open, onToggle }: { q: string; a: string; id: string; open: boolean; onToggle: () => void }) => (
  <div className="border-b border-foreground/10">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={`faq-a-${id}`}
      className="group flex w-full items-start gap-5 py-6 text-start hover:opacity-70 transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <Plus
        aria-hidden="true"
        className={`mt-1 w-5 h-5 shrink-0 text-primary transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "rotate-45" : ""
        }`}
        strokeWidth={2}
      />
      <span className="text-body font-medium leading-[1.35] text-foreground">
        {q}
      </span>
    </button>

    {/* 0fr→1fr is the modern height-auto animation — no measuring, no maxHeight
        guesses that clip long answers. */}
    <div
      id={`faq-a-${id}`}
      role="region"
      className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <p
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
 * in a flat list without one, and this page has nine. The previous version's
 * scroll-spy topic index was a support-portal device the content never needed.
 */
const FAQPage = () => {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [faqs, setFaqs] = useState<Faq[]>(FALLBACK);
  const { to } = useLocalizedPath();
  const { t } = useTranslation("faq");
  const text = useSiteText();

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
  const grouped = faqs.reduce<{ category: string; items: Faq[] }[]>((acc, f) => {
    const bucket = acc.find((g) => g.category === f.category);
    if (bucket) bucket.items.push(f);
    else acc.push({ category: f.category, items: [f] });
    return acc;
  }, []);

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

  // Arriving on /faq#contact (footer, sticky CTA, the About page) should land
  // with the form already open — scrolling someone to a closed row and making
  // them click again is a worse answer than they asked for.
  useEffect(() => {
    if (window.location.hash === "#contact") setFormOpen(true);
  }, []);

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
            <h1 className="font-display font-medium text-display text-foreground text-start">
              {text("faq.title", t("title"))}
            </h1>
            <p className="mt-4 max-w-[46ch] text-small leading-relaxed text-foreground-soft text-start">
              {text("faq.subtitle", t("subtitle"))}
            </p>
          </Reveal>

          <div className="mt-12 md:mt-16">
            {grouped.map((group) => (
              <Reveal key={group.category}>
                <section aria-label={group.category}>
                  {/* A label, not a tab. Hebrew has no uppercase, so size and
                      colour do that job instead. */}
                  <h2 className="mt-14 first:mt-0 mb-4 text-label text-muted-foreground text-start">
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

          <Reveal>
            <p className="mt-14 text-small leading-relaxed text-foreground-soft text-start">
              {t("notFound")}{" "}
              <button
                type="button"
                onClick={() => {
                  setFormOpen(true);
                  document.getElementById("contact")?.scrollIntoView({ block: "start" });
                }}
                className="text-primary decoration-1 underline-offset-4 hover:underline"
              >
                {t("talkToUs")}
              </button>
              {" "}{t("replyTime")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Contact sits directly under the questions rather than on a page of
          its own: someone who read nine answers and still has a question
          shouldn't have to go looking for the way to ask it. /contact
          redirects here.

          The form starts closed and opens on the same plus-row the questions
          use, so the page reads as one list of things you can open rather than
          nine questions followed by a wall of form. */}
      <section id="contact" className="scroll-mt-28 bg-background pb-4">
        <div className="mx-auto max-w-[720px] px-6">
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            aria-expanded={formOpen}
            aria-controls="contact-form-panel"
            className="flex w-full items-start gap-5 border-b border-foreground/10 py-6 text-start hover:opacity-70 transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <Plus
              aria-hidden="true"
              className={`mt-1 w-5 h-5 shrink-0 text-primary transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                formOpen ? "rotate-45" : ""
              }`}
              strokeWidth={2}
            />
            <span className="text-body font-medium leading-[1.35] text-foreground">
              {t("writeToUs")}
            </span>
          </button>
        </div>
      </section>

      <div
        id="contact-form-panel"
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          formOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <Contact />
        </div>
      </div>

      <ShowroomBand />
    </Layout>
  );
};

export default FAQPage;
