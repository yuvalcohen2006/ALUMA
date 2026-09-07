import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
const ProjectEntry = ({ project: p, index }: { project: Project; index: number }) => {
  const { t } = useTranslation("projects");
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
        to={`/projects/${p.slug}`}
        // Deliberately NO aria-label. An aria-label on a container link
        // replaces the name computed from its contents, which would have
        // hidden the meta line and the whole intro from screen readers — the
        // one thing on this page worth reading. MaterialCard wraps its copy in
        // a bare Link for the same reason.
        //
        // The global a:active press would shrink the entire band; on something
        // this large it reads as a layout jolt. The photo lift carries the
        // feedback instead.
        className="group block py-14 lg:py-20 active:transform-none"
      >
        <div
          className={cn(
"grid gap-8 lg:gap-14 xl:gap-16 items-center",
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <div className="absolute inset-0">
                <img
                  src={p.cover}
                  alt={`${p.name} | Aluma`}
                  width={1024}
                  height={768}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
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
              dir="ltr"
              className="block text-start text-label font-medium tracking-[0.14em] tabular-nums text-primary"
            >
              {folio(index + 1)}
            </span>

            <h2 className="mt-3 font-display text-heading font-medium text-foreground decoration-1 underline-offset-[6px] group-hover:underline">
              {p.name}
            </h2>

            {/* The four values plus their rules run past 335px at 375px wide,
                so this line wraps. Each rule therefore travels INSIDE the item
                it follows: a wrap can now only ever leave a rule at the end of
                a line (the left margin in RTL, where it reads as a
                continuation tick) and never orphan one at the right margin
                where the eye starts the next line. */}
            <div className="mt-4 flex flex-wrap items-center gap-y-2 text-body text-muted-foreground">
              {meta.map((m, i) => (
                <span
                  key={`${i}-${m}`}
                  className="inline-flex items-center whitespace-nowrap"
                >
                  {m}
                  {i < meta.length - 1 && <MetaRule className="mx-3" />}
                </span>
              ))}
            </div>

            {/* No paragraph. It was clamped to three lines first, which was
                the wrong fix — none of the fourteen reference indexes carries
                a paragraph per project at all. The index says which projects
                exist and where; the project's own page is where it is
                described, and it opens with this exact text. */}

            {/* Rule grows from the right (the RTL start) on row hover. */}
            <span className="inline-block mt-8">
              <span className="inline-flex items-center gap-2 text-body text-accent">
                {t("viewProject")}
                <ArrowLeft
                  className="w-[18px] h-[18px] transition-transform duration-300 ease-out group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </span>
              <span
                aria-hidden="true"
                className="block h-px w-0 bg-accent/70 transition-[width] duration-500 ease-out group-hover:w-full"
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
  const { projects } = useProjects();
  // No filtering. Six projects is an order of magnitude below where any
  // comparable portfolio keeps a filter — the reference sites that have one
  // carry 37, 57 and 109 projects, and every site at Aluma's scale shows the
  // work and nothing else. A filter over six items mostly advertises that
  // there are only six.

  return (
    <Layout>
      <SEO
        title="פרויקטים | סלוני חוץ בוילות, פנטהאוזים ובתי יוקרה | Aluma"
        description="מבחר פרויקטים נבחרים של Aluma, סלוני חוץ, מרפסות פנורמיות, מתחמי בריכה ופינות אירוח בעיצוב אישי. עבודות בוילות, פנטהאוזים ובתים פרטיים בישראל."
        path="/projects"
        jsonLd={buildCollectionSchema(projects)}
      />
      <PageHero
        title="פרויקטים"
        subtitle="מבחר עבודות שתכננו, ייצרנו והרכבנו: מרפסות פנורמיות, גגות עירוניים, חצרות משפחתיות ומתחמי בריכה."
      />

      {/* The contents strip that used to sit here is gone — a jump-link index
          over six projects, on a page whose whole job is to show six
          projects. None of the fourteen reference portfolios carries in-page
          navigation over its own work at this scale; the ones that carry any
          chrome above the grid have 57 and 109 projects. */}

      {/* THE INDEX */}
      <section className="bg-background pb-6 md:pb-10">
        <div className="container-luxury">
          <div className="divide-y divide-border">
            {projects.map((p, i) => (
              <ProjectEntry key={p.slug} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING BAND — the one dark section on the page. */}
      <section className="py-20 md:py-28 bg-foreground">
        <div className="container-luxury">
          <Reveal className="flex flex-col items-center text-center">
            <SectionHeading
              light
              subtitle="כל פרויקט כאן התחיל בשיחה אחת על המרחב, על האור ועל הדרך שבה המשפחה חיה בחוץ. ספרו לנו על שלכם, ונחזור אליכם עם תכנון ראשוני."
            >
              המרחב הבא שנתכנן הוא שלכם
            </SectionHeading>
            {/* Label kept short on purpose. ShineButton is one fixed size with
                3.2em of side padding at 17px — roughly 110px of chrome before a
                single glyph — so a 21-character label overran the 335px of
                content width a 375px phone has. Every other CTA on the site
                sits at 10–16 characters; this now matches. */}
            <div className="mt-9">
              <ShineButton to="/contact" invert>
                לתיאום שיחה
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </ShineButton>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectsPage;
