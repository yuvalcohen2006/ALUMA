import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import { type Project } from "@/data/projects";
import { useProjects } from "@/hooks/useProjectsData";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import TileCard from "@/components/TileCard";
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

/**
 * פרויקטים.
 *
 * The same page as Collections: the title on its own, then a grid of tiles —
 * a photograph, the name under it, and where and when in small type. It was a
 * run of full-width zig-zag bands, each a photograph with a numeral, a name and
 * a link floating in the empty half beside it, and the last photograph faded
 * out into the page. The owner called it horrendous, and next to the
 * collections grid it did look like a different site.
 *
 * Landscape tiles, two across: these are photographs of whole terraces and
 * gardens, and a portrait crop like the collections' would cut the furniture
 * out of most of them. Every project is shown; the list used to stop at three,
 * which would also have hidden real projects the owner publishes.
 */
const ProjectsPage = () => {
  const { t } = useTranslation("projects");
  const { to } = useLocalizedPath();
  const { projects, loading } = useProjects();

  return (
    <Layout>
      <SEO
        title={t("seoTitle")}
        description={t("seoDescription")}
        path="/projects"
        jsonLd={buildCollectionSchema(projects)}
      />

      {/* No subtitle, like Collections: the photographs say what the page is. */}
      <PageHero title={t("hero.title")} />

      <div className="container-luxury pb-24 md:pb-32">
        {loading ? (
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="animate-pulse space-y-4">
                <div className="aspect-[3/2] rounded-sm bg-secondary" />
                <div className="h-5 w-1/3 rounded-sm bg-secondary" />
              </li>
            ))}
          </ul>
        ) : (
          <ul role="list" className="tile-grid grid gap-x-6 gap-y-12 sm:grid-cols-2 md:gap-y-16">
            {projects.map((p, i) => (
              // The id keeps /projects#slug links landing on their project.
              <li key={p.slug} id={p.slug} className="scroll-mt-28 md:scroll-mt-32">
                <Reveal delay={(i % 2) * 70}>
                  <TileCard
                    to={to(`/projects/${p.slug}`)}
                    image={p.cover}
                    alt=""
                    title={p.name}
                    meta={[p.location, p.year].filter(Boolean).join(" - ")}
                    aspect="3/2"
                    eager={i < 2}
                    as="h2"
                    // A project saved with a title and no photograph is a state
                    // the admin allows; it still gets a tile of the right shape.
                    fallback={<TileFallback name={p.name} />}
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>

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
