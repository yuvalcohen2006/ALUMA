import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import Contact from "@/components/Contact";
import ShowroomBand from "@/components/contact/ShowroomBand";
import { useTranslation } from "react-i18next";

/**
 * Structure only — the copy lives in the faq catalogs (he + en), so this page
 * translates with the rest of the site. i18n keys, not literals.
 */
const categories = [
  { id: "faq-buy", labelKey: "cats.buy", items: ["price", "leadTime", "delivery"] },
  { id: "faq-materials", labelKey: "cats.materials", items: ["outdoor", "quality", "care"] },
  { id: "faq-service", labelKey: "cats.service", items: ["warranty", "showroom"] },
] as const;



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
      <span className="text-[19px] md:text-[21px] font-medium leading-[1.35] text-foreground">
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
          className={`ps-10 pb-8 pt-1 max-w-[62ch] text-[16px] md:text-[17px] leading-[1.6] text-foreground-soft transition-opacity duration-300 ${
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
  const { to } = useLocalizedPath();
  const { t } = useTranslation("faq");

  // Regenerated from the catalog in the ACTIVE language, so the structured
  // data always matches what the page shows.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categories.flatMap((c) =>
      c.items.map((key) => ({
        "@type": "Question",
        name: t(`q.${key}.q`),
        acceptedAnswer: { "@type": "Answer", text: t(`q.${key}.a`) },
      })),
    ),
  };

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
            <h1 className="font-display font-semibold text-[40px] md:text-[56px] leading-[1.08] text-foreground text-start">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-[46ch] text-[17px] md:text-[19px] leading-relaxed text-foreground-soft text-start">
              {t("subtitle")}
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
                    className="mt-14 first:mt-0 mb-4 text-[13px] font-semibold tracking-[0.08em] text-primary text-start"
                  >
                    {t(cat.labelKey)}
                  </h2>
                  {cat.items.map((key) => (
                    <FaqRow
                      key={key}
                      id={key}
                      q={t(`q.${key}.q`)}
                      a={t(`q.${key}.a`)}
                      open={open.has(key)}
                      onToggle={() => toggle(key)}
                    />
                  ))}
                </section>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-14 text-[17px] leading-relaxed text-foreground-soft text-start">
              {t("notFound")}{" "}
              <a
                href="#contact"
                className="text-primary decoration-1 underline-offset-4 hover:underline"
              >
                {t("talkToUs")}
              </a>
              {" "}{t("replyTime")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Contact sits directly under the questions rather than on a page of
          its own: someone who read nine answers and still has a question
          shouldn't have to go looking for the way to ask it. /contact
          redirects here. */}
      <Contact />
      <ShowroomBand />
    </Layout>
  );
};

export default FAQPage;
