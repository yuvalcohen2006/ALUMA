import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import { type Project } from "@/data/projects";
import { useProjects } from "@/hooks/useProjectsData";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import TileFallback from "@/components/TileFallback";
import DirectionalArrow from "@/components/DirectionalArrow";

const SITE = "https://alumaoutdoor.com";

// Built from whatever the page actually loaded, so a CMS-managed list is what
// gets described to crawlers rather than the static fallback.
const buildCollectionSchema = (list: Project[]) => ({
"@context": "https://schema.org",
"@type": "CollectionPage",
  name: "פרויקטים של Aluma",
  description:
"גלריית פרויקטים נבחרים של Aluma, סלוני חוץ ומרחבי חוץ יוקרתיים בוילות, פנטהאוזים ובתי יוקרה בישראל.",
  url: `${SITE}/projects`,
  inLanguage: "he-IL",
  mainEntity: {
"@type": "ItemList",
    numberOfItems: list.length,
    itemListElement: list.map((p, i) => ({
"@type": "ListItem",
      position: i + 1,
      item: {
"@type": "CreativeWork",
        name: p.name,
        url: `${SITE}/projects/${p.slug}`,
      },
    })),
  },
});

/** Folio number, printed-portfolio style: 1 → "01". */
const folio = (n: number) => String(n).padStart(2, "0");


/** Thin terracotta rule between meta values. */
const MetaRule = ({ className }: { className?: string }) => (
  <span
    className={cn("w-px h-4 bg-foreground/15 shrink-0", className)}
    aria-hidden="true"
  />
);

/**
 * One entry in the index — a full-width editorial band.
 *
 * Even entries put the photo on the RIGHT (the RTL start, so the photo is the
 * first thing the eye lands on), odd entries flip it to the left. Nothing else
 * about the row changes between the two, which is what keeps the alternation
 * readable instead of busy: same folio numeral, same meta rules, same hairline.
 *
 * The whole band is one link and one tab stop. Hovering anywhere in it warms
 * the numeral and lifts the photo — the photo itself never changes, so the row
 * stays calm rather than flickering to a different image under the cursor.
 */
const ProjectEntry = ({
  project: p,
  index,
  isLast,
}: {
  project: Project;
  index: number;
  isLast: boolean;
}) => {
  const { t } = useTranslation("projects");
  const { to } = useLocalizedPath();
  const photoRight = index % 2 === 0;
  // Two values, not four. Across fourteen architecture and furniture indexes
  // the median card carries five or six words of metadata and the near-
  // universal pair is place plus year — type and area are exactly what the
  // references drop. Four values also wrapped at 375px, which is what the
  // rule-inside-the-item trick below was working around.
  const meta = [p.location, p.year].filter(Boolean);

  return (
    // tabIndex/-1 + outline-none: the id is still a deep-link target, so the
    // element has to be focusable without ever becoming a tab stop or drawing
    // a stray ring.
    <article
      id={p.slug}
      tabIndex={-1}
      className="scroll-mt-[120px] focus:outline-none"
    >
      <Link
        to={to(`/projects/${p.slug}`)}
        // Deliberately NO aria-label. An aria-label on a container link
        // replaces the name computed from its contents, which would have
        // hidden the meta line and the whole intro from screen readers — the
        // one thing on this page worth reading. MaterialCard wraps its copy in
        // a bare Link for the same reason.
        //
        // The global a:active press would shrink the entire band; on something
        // this large it reads as a layout jolt. The photo lift carries the
        // feedback instead.
        className="group block py-10 lg:py-14 active:transform-none"
      >
        <div
          className={cn(
"grid items-center gap-7 lg:gap-12",
            photoRight
              ? "lg:grid-cols-[1.4fr_1fr]"
              : "lg:grid-cols-[1fr_1.4fr]"
          )}
        >
          {/* PHOTO */}
          <Reveal
            className={cn("min-w-0", photoRight ? "lg:order-1" : "lg:order-2")}
          >
            {/* The photograph does not move. Not one of the fourteen reference
                indexes transforms its project image on hover — at this size a
                zoom reads as a slideshow effect rather than as a response, and
                a 1.06 scale on a 900px band is a lot of pixels resampling. The
                title underline and the cue below carry the hover instead. */}
            {/*
              The last photograph on the page dissolves downward into the white
              rather than stopping on a hard edge, so the list ends by trailing
              off instead of by running out. Downward, not sideways: a row
              continues along the inline axis, a list continues down the page.

              The mask lands on the frame and never on the link — a mask clips
              its own element's focus ring, so a keyboard user would otherwise
              tab to a project with no visible ring at all.
            */}
            <div
              className={cn(
                "relative aspect-[3/2] overflow-hidden rounded-sm",
                isLast && "tile-fade-b",
              )}
            >
              <div className="absolute inset-0">
                {/* A project saved with a title and no photograph is a state
                    the admin allows, and `<img src="">` renders as a broken
                    image across two thirds of the row. */}
                {p.cover ? (
                  <img
                    src={p.cover}
                    alt=""
                    width={1024}
                    height={768}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <TileFallback name={p.name} />
                )}
              </div>
            </div>
          </Reveal>

          {/* TEXT */}
          <Reveal
            delay={140}
            className={cn(
"min-w-0 text-start",
              photoRight ? "lg:order-2" : "lg:order-1"
            )}
          >
            {/* The folio numeral, demoted from a 58px display glyph to a
                quiet eyebrow. It keeps the 01–06 editorial device, but the
                project name gets the headline job back — at the homepage
                tile's own type scale, so the two pages speak in one voice. */}
            <span
              aria-hidden="true"
              className="block text-start text-label font-medium tracking-[0.14em] tabular-nums text-accent"
            >
              {folio(index + 1)}
            </span>

            <h2
              dir="auto"
              className="mt-3 font-display text-heading font-medium text-start text-foreground decoration-1 underline-offset-[6px] group-hover:underline"
            >
              {p.name}
            </h2>

            {/* The four values plus their rules run past 335px at 375px wide,
                so this line wraps. Each rule therefore travels INSIDE the item
                it follows: a wrap can now only ever leave a rule at the end of
                a line (the left margin in RTL, where it reads as a
                continuation tick) and never orphan one at the right margin
                where the eye starts the next line. */}
            {meta.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-y-2 text-body text-muted-foreground">
              {meta.map((m, i) => (
                <span
                  key={`${i}-${m}`}
                  dir="auto"
                  // No `whitespace-nowrap`: a CMS location is free text with
                  // no length limit, and one long enough pushed the whole page
                  // wider than the phone reading it. The value is a single
                  // flex item, so it wraps within itself while the rule beside
                  // it still cannot be separated from it.
                  className="inline-flex min-w-0 items-center text-start [overflow-wrap:anywhere]"
                >
                  {m}
                  {i < meta.length - 1 && <MetaRule className="mx-3" />}
                </span>
              ))}
            </div>
            )}

            {/* No paragraph. It was clamped to three lines first, which was
                the wrong fix — none of the fourteen reference indexes carries
                a paragraph per project at all. The index says which projects
                exist and where; the project's own page is where it is
                described, and it opens with this exact text. */}

            {/* Rule grows from the right (the RTL start) on row hover. */}
            <span className="inline-block mt-8">
              <span className="inline-flex items-center gap-2 text-body text-accent">
                {t("viewProject")}
                <DirectionalArrow className="w-[18px] h-[18px]" />
              </span>
              <span
                aria-hidden="true"
                className="block h-px w-0 bg-accent/70 transition-[width] duration-500 ease-out group-hover:w-full group-focus-visible:w-full"
              />
            </span>
          </Reveal>
        </div>
      </Link>
    </article>
  );
};

const ProjectsPage = () => {
  const { t } = useTranslation("projects");
  const { to } = useLocalizedPath();
  const { projects, loading } = useProjects();
  // Three, not six. These are placeholder examples until real work is
  // photographed, and six of them is a wall rather than a portfolio — the
  // third one dissolving says "and there is more" better than three more
  // invented ones would.
  const shown = projects.slice(0, 3);
  // No filtering. Six projects is an order of magnitude below where any
  // comparable portfolio keeps a filter — the reference sites that have one
  // carry 37, 57 and 109 projects, and every site at Aluma's scale shows the
  // work and nothing else. A filter over six items mostly advertises that
  // there are only six.

  return (
    <Layout>
      <SEO
        title={t("seoTitle")}
        description={t("seoDescription")}
        path="/projects"
        jsonLd={buildCollectionSchema(projects)}
      />
      <PageHero title={t("hero.title")} subtitle={t("hero.subtitle")} />

      {/* The contents strip that used to sit here is gone — a jump-link index
          over six projects, on a page whose whole job is to show six
          projects. None of the fourteen reference portfolios carries in-page
          navigation over its own work at this scale; the ones that carry any
          chrome above the grid have 57 and 109 projects. */}

      {/* THE INDEX */}
      <section className="bg-background pb-6 md:pb-10">
        <div className="container-luxury">
          <div className="divide-y divide-border">
            {loading &&
              [0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse py-10 lg:py-14">
                  <div className="aspect-[3/2] rounded-sm bg-secondary" />
                  <div className="mt-6 h-6 w-1/3 rounded-sm bg-secondary" />
                </div>
              ))}
            {!loading &&
              shown.map((p, i) => (
                <ProjectEntry
                  key={p.slug}
                  project={p}
                  index={i}
                  // The fade says "the list carries on past here", which needs
                  // a list. On a site with one published project it was simply
                  // a half-erased photograph, the only one on the page.
                  isLast={shown.length > 1 && i === shown.length - 1}
                />
              ))}
          </div>
        </div>
      </section>

      {/* CLOSING BAND — the one dark section on the page. */}
      <section className="py-20 md:py-28 bg-foreground">
        <div className="container-luxury">
          <Reveal className="flex flex-col items-center text-center">
            <SectionHeading light subtitle={t("cta.subtitle")}>
              {t("cta.title")}
            </SectionHeading>
            {/* Label kept short on purpose. ShineButton is one fixed size with
                3.2em of side padding at 17px — roughly 110px of chrome before a
                single glyph — so a 21-character label overran the 335px of
                content width a 375px phone has. Every other CTA on the site
                sits at 10–16 characters; this now matches. */}
            <div className="mt-9">
              <ShineButton to={to("/faq") + "#contact"} invert>
                {t("cta.button")}
                <DirectionalArrow className="w-4 h-4" animate={false} />
              </ShineButton>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectsPage;
