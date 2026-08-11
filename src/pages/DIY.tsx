import { Link } from "react-router-dom";
import { ArrowLeft, Palette, ScanLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { sunbrellaFabrics } from "@/data/sunbrella";

/**
 * DIY hub — two doors, one screen.
 *
 * This page used to run about four hundred lines: an intro section, a
 * cursor-tracked lamp, four "bench planks", a rail of questionnaire steps and a
 * closing charcoal band. It also announced four tools when only two of them
 * still existed — /designer had already become a redirect back to this very
 * page, so its own structured data pointed customers at a loop.
 *
 * There are exactly two things you can do here, so the page is exactly two
 * things: see every fabric in every colour, or stand a piece in your own garden
 * through the phone. Both fit above the fold side by side, which is the whole
 * point — a hub you have to scroll is a hub that failed to be a hub.
 *
 * Each door shows a specimen of the real thing rather than a stock photo: the
 * actual Sunbrella swatches, and a drawn floor plane with the AR reticle on it.
 */

const SITE = "https://alumaoutdoor.com";

/** Twelve swatches spread across all three Sunbrella families. */
const swatches = sunbrellaFabrics.filter((_, i) => i % 3 === 0).slice(0, 12);

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "דף הבית", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "עשה זאת בעצמך", item: `${SITE}/diy` },
  ],
};

/** Two entries, matching the two that exist. */
const toolList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "כלים לתכנון עצמי של ריהוט חוץ",
  inLanguage: "he-IL",
  itemListElement: [
    { name: "בחירת בד וצבע", url: `${SITE}/fabric` },
    { name: "תצוגה במרחב, AR", url: `${SITE}/ar` },
  ].map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: t.url })),
};

const Door = ({
  icon: Icon,
  eyebrow,
  title,
  line,
  cta,
  to,
  children,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  line: string;
  cta: string;
  to: string;
  /** The specimen shown above the words. */
  children: React.ReactNode;
}) => (
  <li>
    <Link
      to={to}
      className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-border bg-background transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-luxury focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative h-[190px] md:h-[220px] overflow-hidden bg-secondary/40">
        {children}
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-8 text-start">
        <span className="inline-flex items-center gap-2 text-[15px] tracking-[0.06em] text-accent">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {eyebrow}
        </span>

        <h2 className="mt-3 font-display font-semibold text-[26px] md:text-[30px] leading-tight text-foreground">
          {title}
        </h2>

        <p className="mt-2.5 text-[17px] md:text-[18px] leading-relaxed text-foreground-soft">
          {line}
        </p>

        <span className="mt-6 inline-flex items-center gap-2 text-[18px] text-foreground transition-colors duration-200 group-hover:text-accent">
          {cta}
          {/* Left is forward in Hebrew. */}
          <ArrowLeft
            className="h-[18px] w-[18px] transition-transform duration-200 group-hover:-translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  </li>
);

const DIYPage = () => {
  const { to } = useLocalizedPath();

  return (
    <Layout>
      <SEO
        title="עשה זאת בעצמך | בחירת בד ותצוגה במרחב | Aluma"
        description="שני כלים שרצים ישר מהדפדפן: לראות כל בד Sunbrella בצבע שלו על ספה אמיתית, או להעמיד רהיט בחצר שלכם דרך מצלמת הטלפון."
        path="/diy"
        jsonLd={[breadcrumbs, toolList]}
      />

      <PageHero
        title="עשה זאת בעצמך"
        subtitle="שני דברים אפשר לעשות כאן, בלי הרשמה ובלי עלות: לראות איך כל בד נראה בצבע שלו, או להעמיד רהיט בחצר דרך הטלפון."
      />

      <section className="pb-16 md:pb-24 bg-background">
        <div className="container-luxury">
          <ul className="grid gap-4 md:grid-cols-2 md:items-stretch">
            <Reveal>
              <Door
                icon={Palette}
                eyebrow="בדים וצבעים"
                title="לראות את הבד לפני שבוחרים"
                line="כל גוון מהמניפה של Sunbrella, על ספה אמיתית ולא על ריבוע קטן. מחליפים צבע ורואים מיד."
                cta="לבחירת הבד"
                to={to("/fabric")}
              >
                {/* Specimen: the real swatch colours, edge to edge. */}
                <ul className="absolute inset-0 grid grid-cols-6 grid-rows-2">
                  {swatches.map((f) => (
                    <li
                      key={f.code}
                      title={f.nameHe}
                      style={{ background: f.background }}
                      className="transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ))}
                </ul>
              </Door>
            </Reveal>

            <Reveal delay={90}>
              <Door
                icon={ScanLine}
                eyebrow="תצוגה במרחב"
                title="להעמיד את הרהיט בחצר שלכם"
                line="פותחים בטלפון, מכוונים את המצלמה לרצפה, והפריט עומד אצלכם בגודל האמיתי שלו — לפני שהזמנתם."
                cta="פתחו את התצוגה"
                to={to("/ar")}
              >
                {/* Specimen: a floor plane in perspective with the AR reticle
                    resting on it. Drawn rather than photographed, because the
                    thing being promised is a measurement, not a mood. */}
                <div className="absolute inset-0 overflow-hidden bg-foreground">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-[-40%] bottom-[-30%] h-[150%] opacity-[0.22] transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    style={{
                      transform: "perspective(340px) rotateX(58deg)",
                      backgroundImage:
                        "linear-gradient(to right, hsl(var(--background)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--background)) 1px, transparent 1px)",
                      backgroundSize: "44px 44px",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-[58%] h-[54px] w-[132px] -translate-x-1/2 rounded-[50%] border-2 border-background/70"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-[58%] h-[14px] w-[34px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-background/25"
                  />
                </div>
              </Door>
            </Reveal>
          </ul>
        </div>
      </section>
    </Layout>
  );
};

export default DIYPage;
