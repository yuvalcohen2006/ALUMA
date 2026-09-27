import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteContact } from "@/hooks/useSiteContact";
import portraitIdan from "@/assets/about/portrait-idan.webp";
import portraitRoy from "@/assets/about/portrait-roy.webp";
import portraitBen from "@/assets/about/portrait.webp";
import { useTranslation } from "react-i18next";

const breadcrumbs = {
"@context": "https://schema.org",
"@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "דף הבית", item: "https://alumaoutdoor.com/" },
    { "@type": "ListItem", position: 2, name: "אודות", item: "https://alumaoutdoor.com/story" },
  ],
};

/**
 * The three portrait drawings, in the order the work happens: measuring,
 * materials, installation. The names under them went at the owner's request,
 * and later the step titles and the lines under them went as well, so the
 * drawings now stand on their own.
 */
const PORTRAITS = [
  { src: portraitIdan, key: "measure" },
  { src: portraitRoy, key: "materials" },
  { src: portraitBen, key: "install" },
] as const;

/**
 * אודות.
 *
 * Opens on the same title every interior page has (PageHero), in the same
 * place as Collections, Projects and DIY. Then:
 *
 *   1. The name: aluminium and light, as text.
 *   2. The three portrait drawings on a tinted band.
 *   3. The invitation to the showroom, with a real button.
 *
 * The owner cut the logo over the title, the lead under it, the terrace and
 * craft photographs, the "how a piece comes to be" heading and the text under
 * each drawing, and the faint wordmark that closed the page.
 *
 * Paragraphs are `text-body` in the foreground colour: this is the page people
 * read to decide whether to trust the company.
 */
const StoryPage = () => {
  const { t } = useTranslation("about");
  // Live contact facts, falling back to src/config/site.ts.
  const SITE = useSiteContact();
  const { to } = useLocalizedPath();

  return (
    <Layout>
      <SEO
        title={t("seo.title")}
        description={t("seo.description")}
        path="/story"
        jsonLd={breadcrumbs}
      />

      <PageHero title={t("statement")} />

      {/* 1 — THE NAME. */}
      <section className="bg-background">
        <div className="container-luxury pb-20 md:pb-28">
          <Reveal>
            <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
              {t("storyLead")}
            </h2>
            <div className="mt-6 max-w-[64ch] space-y-5 text-start text-body tracking-normal text-foreground">
              <p>{t("story.one")}</p>
              <p className="text-foreground-soft">{t("story.two")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — THE DRAWINGS. Transparent line art, so they sit on the band as
          drawn rather than needing a blend mode. */}
      <section className="border-y border-border bg-secondary">
        <div className="container-luxury py-16 md:py-24">
          <ul className="grid gap-12 sm:grid-cols-3 sm:gap-8 lg:gap-14">
            {PORTRAITS.map((portrait, i) => (
              <li key={portrait.key}>
                <Reveal delay={i * 80}>
                  <img
                    src={portrait.src}
                    alt={t("portraitAlt")}
                    width={560}
                    height={560}
                    loading="lazy"
                    decoding="async"
                    className="mx-auto aspect-square w-full max-w-[220px] object-contain object-bottom sm:max-w-[320px]"
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 — THE INVITATION. A button, not an underlined link: it is the one
          thing this page asks a visitor to do. */}
      <section className="bg-background">
        <div className="container-luxury py-24 text-center md:py-32">
          <Reveal>
            <h2 className="mx-auto text-balance font-display text-display font-normal tracking-normal text-foreground">
              {/* Isolated: the address is Hebrew, and dropped bare into the
                  English sentence its number and comma were reordered. */}
              {t("closeBody", { address: `\u2068${SITE.address.full}\u2069` })}
            </h2>
            <Button asChild size="lg" className="mt-10">
              <Link to={to("/faq") + "#contact"}>{t("visitCta")}</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default StoryPage;
