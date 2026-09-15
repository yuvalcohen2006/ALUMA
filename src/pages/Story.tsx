import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteContact } from "@/hooks/useSiteContact";
import alumaLogo from "@/assets/aluma-logo.png";
import terraceDusk from "@/assets/about/terrace-dusk.webp";
import craftDetail from "@/assets/about/craft-detail.webp";
import portraitIdan from "@/assets/about/portrait-idan.webp";
import portraitRoy from "@/assets/about/portrait-roy.webp";
import portraitBen from "@/assets/about/portrait.webp";
import { useTranslation } from "react-i18next";
import { HIGH_FETCH_PRIORITY } from "@/lib/img-priority";

const breadcrumbs = {
"@context": "https://schema.org",
"@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "דף הבית", item: "https://alumaoutdoor.com/" },
    { "@type": "ListItem", position: 2, name: "אודות", item: "https://alumaoutdoor.com/story" },
  ],
};

/**
 * How a piece is made, one step per portrait.
 *
 * The drawings stay; the names under them went, at the owner's request, and
 * with them the "three of us" framing. What the three portraits still carry
 * is the part a visitor is actually asking about — who does what — so each is
 * now a step rather than a person, in the order the work happens.
 */
const STEPS = [
  { src: portraitIdan, key: "measure" },
  { src: portraitRoy, key: "materials" },
  { src: portraitBen, key: "install" },
] as const;

/**
 * אודות.
 *
 * The second version of this page, and the brief for it was "no dead zones".
 * The first was one 860px column down the middle of a 1440px screen, with
 * 200px of padding above every section — a third of each side of the screen
 * empty, and paragraphs set at 16px in a grey that read as a caption. It also
 * carried a list of refusals ("what we don't do") that the owner cut.
 *
 * Four sections now, each using the width:
 *
 *   1. The line and the lead side by side, over the terrace photograph —
 *      the one image on the site that shows a home carrying on outdoors,
 *      which is exactly what the line says.
 *   2. The name: aluminium and light, beside a close-up of an aluminium
 *      frame meeting a wooden arm.
 *   3. How a piece comes to be, on a tinted band, one portrait per step.
 *   4. The invitation to the showroom, with a real button.
 *
 * Paragraphs are `text-lead` and `text-body` in the foreground colour: this is
 * the page people read to decide whether to trust the company, and it was set
 * like small print.
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

      {/* 1 — THE LINE. */}
      <section className="bg-background">
        <div className="mx-auto max-w-[1440px] px-5 pt-32 md:px-10 md:pt-40 lg:px-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
            <Reveal className="lg:col-span-7">
              <img src={alumaLogo} alt="Aluma" className="mb-10 h-6 w-auto opacity-80 md:mb-12 md:h-7" />
              {/* tracking-normal throughout: letter-spacing breaks Hebrew
                  rhythm and is the clearest tell of an un-adapted RTL design. */}
              {/* Balanced, so the English line does not leave "door." on
                  a line of its own. The Hebrew fits on one either way. */}
              <h1 className="text-balance text-start font-display text-display font-normal tracking-normal text-foreground">
                {t("statement")}
              </h1>
            </Reveal>
            <Reveal delay={80} className="lg:col-span-5">
              <p className="max-w-[52ch] text-start text-lead text-foreground">{t("lead")}</p>
            </Reveal>
          </div>

          {/* Wide on a wide screen, where the whole terrace fits; on a phone
              a 4:3 cut held on the sofa, which is what the line is about. */}
          <Reveal delay={120}>
            <div className="mt-12 overflow-hidden rounded-sm bg-muted md:mt-16">
              <img
                src={terraceDusk}
                alt={t("terraceAlt")}
                width={2400}
                height={1029}
                {...HIGH_FETCH_PRIORITY}
                decoding="async"
                className="aspect-[4/3] w-full object-cover object-[80%_center] md:aspect-[21/9] md:object-center"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — THE NAME. */}
      <section className="bg-background">
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28 lg:px-16">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
                {t("storyLead")}
              </h2>
              <div className="mt-6 max-w-[56ch] space-y-5 text-start text-body tracking-normal text-foreground">
                <p>{t("story.one")}</p>
                <p className="text-foreground-soft">{t("story.two")}</p>
              </div>
            </Reveal>
            <Reveal delay={80} className="lg:col-span-7">
              <div className="overflow-hidden rounded-sm bg-muted">
                <img
                  src={craftDetail}
                  alt={t("craftAlt")}
                  width={1600}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3 — HOW A PIECE COMES TO BE. The portraits are transparent line art
          now, so they sit on the band as drawn rather than needing a blend
          mode, and the Reveal wrapper around them is safe. */}
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28 lg:px-16">
          <Reveal>
            <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
              {t("processTitle")}
            </h2>
          </Reveal>

          <ol className="mt-12 grid gap-14 sm:grid-cols-3 sm:gap-8 md:mt-14 lg:gap-14">
            {STEPS.map((step, i) => (
              <li key={step.key}>
                <Reveal delay={i * 80}>
                  <img
                    src={step.src}
                    alt={t("portraitAlt")}
                    width={560}
                    height={560}
                    loading="lazy"
                    decoding="async"
                    className="mx-auto aspect-square w-full max-w-[220px] object-contain object-bottom sm:max-w-[320px]"
                  />
                  <div className="mt-6 border-t border-foreground/15 pt-6 text-start">
                    <p className="text-label tabular-nums text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-tile text-foreground">{t(`process.${step.key}.title`)}</h3>
                    <p className="mt-2 max-w-[40ch] text-body text-foreground-soft">
                      {t(`process.${step.key}.body`)}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 — THE INVITATION. A button, not an underlined link: it is the one
          thing this page asks a visitor to do. The wordmark still closes the
          page, smaller and nearer than it was. */}
      <section className="bg-background">
        <div className="mx-auto max-w-[1440px] px-5 py-24 text-center md:px-10 md:py-32 lg:px-16">
          <Reveal>
            {/* A sentence to a line. Left to wrap, the break fell after the
                first word of the second sentence, which read as a typo. */}
            <h2 className="mx-auto font-display text-display font-normal tracking-normal text-foreground">
              {t("closeTitle")
                .split(/(?<=\.)\s+/)
                .map((sentence, i) => (
                  <span key={i} className="block">
                    {sentence}
                  </span>
                ))}
            </h2>
            <p className="mx-auto mt-6 max-w-[48ch] text-lead text-foreground-soft">
              {/* Isolated: the address is Hebrew, and dropped bare into the
                  English sentence its number and comma were reordered. */}
              {t("closeBody", { address: `\u2068${SITE.address.full}\u2069` })}
            </p>
            <Button asChild size="lg" className="mt-10">
              <Link to={to("/faq") + "#contact"}>{t("visitCta")}</Link>
            </Button>
            <img
              src={alumaLogo}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="mx-auto mt-16 h-8 w-auto opacity-25 md:mt-20 md:h-10"
            />
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default StoryPage;
