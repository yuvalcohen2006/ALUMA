import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import Contact from "@/components/Contact";
import ShowroomRail from "@/components/contact/ShowroomRail";
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
 * Q&A, as two columns: the questions on the reading edge, the showroom on a
 * rail beside them.
 *
 * The page used to be a single 720px measure with the showroom band parked at
 * the very bottom. That put "are you open right now" and "where are you" — the
 * two things a reader reaches for WHILE reading the answers — behind every
 * question on the page. The rail keeps them in view the whole way down and
 * costs the questions nothing, because a 62ch measure never wanted the full
 * width anyway.
 *
 * Category headings carry the numeral-and-rule device the Projects index and
 * the About page already use. They were 13px tracked terracotta labels, which
 * is a caption pretending to be a heading: too quiet to group anything, and the
 * only place on the site using that treatment.
 *
 * Still a flat accordion with several rows openable at once, and still no
 * search — eight questions is far below where NN/g/Baymard put the threshold
 * for one.
 */
const FAQPage = () => {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
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

  // Arriving on /faq#contact (footer, sticky CTA, the About page) should land
  // with the form already open — scrolling someone to a closed row and making
  // them click again is a worse answer than they asked for.
  useEffect(() => {
    if (window.location.hash === "#contact") setFormOpen(true);
  }, []);

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

      {/* pb-3 leaves the same 12px seam the home page runs between its tiles,
          so the rail's charcoal stops just short of the footer's rather than
          fusing into one indistinguishable slab. */}
      <section className="pt-36 pb-3 md:pt-44 bg-background">
        <div className="container-luxury">
          <Reveal>
            {/* Apple's two-beat heading convention, not the word "FAQ". */}
            <h1 className="font-display font-semibold text-[40px] md:text-[56px] leading-[1.08] text-foreground text-start">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-[52ch] text-[17px] md:text-[19px] leading-relaxed text-foreground-soft text-start">
              {t("subtitle")}
            </p>
          </Reveal>

          {/* Questions first, so RTL puts them on the right and the rail on the
              left. items-stretch (the default) is what lets the rail run the
              full height of the row down to the seam. */}
          <div className="mt-12 md:mt-16 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              {categories.map((cat, ci) => (
                <Reveal key={cat.id}>
                  <section aria-labelledby={cat.id} className="mt-12 first:mt-0">
                    {/* Numeral, name, rule — the same device the Projects folio
                        and the About page values run on. */}
                    <div className="mb-4 flex items-baseline gap-4">
                      <span
                        aria-hidden="true"
                        className="font-display text-[20px] leading-none tabular-nums text-primary/55"
                      >
                        {String(ci + 1).padStart(2, "0")}
                      </span>
                      <h2
                        id={cat.id}
                        className="font-display font-semibold text-[24px] md:text-[27px] leading-tight text-foreground"
                      >
                        {t(cat.labelKey)}
                      </h2>
                      <span aria-hidden="true" className="h-px flex-1 bg-foreground/12" />
                    </div>

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

              {/* Contact sits at the end of the questions rather than on a page
                  of its own: someone who read eight answers and still has a
                  question shouldn't have to go looking for the way to ask it.
                  /contact redirects here. It opens on the same plus-row the
                  questions use, so the column reads as one list of things you
                  can open. */}
              <div id="contact" className="scroll-mt-28">
                <button
                  type="button"
                  onClick={() => setFormOpen((v) => !v)}
                  aria-expanded={formOpen}
                  aria-controls="contact-form-panel"
                  className="mt-12 flex w-full items-start gap-5 border-b border-foreground/10 py-6 text-start hover:opacity-70 transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <Plus
                    aria-hidden="true"
                    className={`mt-1 w-5 h-5 shrink-0 text-primary transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      formOpen ? "rotate-45" : ""
                    }`}
                    strokeWidth={2}
                  />
                  <span className="text-[19px] md:text-[21px] font-medium leading-[1.35] text-foreground">
                    {t("writeToUs")}
                  </span>
                </button>

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
              </div>

              <Reveal>
                <p className="mt-10 text-[17px] leading-relaxed text-foreground-soft text-start">
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

            <ShowroomRail />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQPage;
