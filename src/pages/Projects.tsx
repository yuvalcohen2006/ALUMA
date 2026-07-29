import { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import FilterSidebar, { type FilterGroup } from "@/components/FilterSidebar";
import { useFilterParams } from "@/hooks/useFilterParams";
import { projects, type Project } from "@/data/projects";
import { cn } from "@/lib/utils";

const SITE = "https://alumaoutdoor.com";

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "פרויקטים של Aluma",
  description:
    "גלריית פרויקטים נבחרים של Aluma, סלוני חוץ ומרחבי חוץ יוקרתיים בוילות, פנטהאוזים ובתי יוקרה בישראל.",
  url: `${SITE}/projects`,
  inLanguage: "he-IL",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: p.name,
        url: `${SITE}/projects/${p.slug}`,
      },
    })),
  },
};

// Built from the data rather than hardcoded, so values arriving from the CMS
// show up in the drawer without a code change.
const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "he"));

/** Folio number, printed-portfolio style: 1 → "01". */
const folio = (n: number) => String(n).padStart(2, "0");

/**
 * Contents-strip jump. A real `#slug` href is kept on the anchor (copy/middle
 * click still work), but the click is handled here so no history entry is
 * pushed — a hash push can flip react-router's navigation type and make
 * ScrollToTop yank the page back to the top mid-jump.
 *
 * `behavior: "instant"` rather than `"auto"` for the reduced-motion path:
 * index.css sets `html { scroll-behavior: smooth }`, and per CSSOM `"auto"`
 * defers to that CSS property — so `"auto"` would still animate. Only
 * `"instant"` actually overrides it.
 *
 * Focus follows the jump (the entry is a programmatic focus target) so a
 * keyboard user carries on tabbing from the project they picked instead of
 * from the strip. `preventScroll` keeps the focus call from re-scrolling and
 * cancelling the smooth animation.
 */
const jumpToEntry = (slug: string) => {
  const el = document.getElementById(slug);
  if (!el) return;
  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
  el.focus({ preventScroll: true });
};

/** Thin terracotta rule between meta values. */
const MetaRule = ({ className }: { className?: string }) => (
  <span
    className={cn("w-px h-4 bg-primary/45 shrink-0", className)}
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
  const photoRight = index % 2 === 0;
  const meta = [p.location, p.tag, p.year, p.area].filter(Boolean);

  return (
    // tabIndex/-1 + outline-none: a target for jumpToEntry's focus move, never
    // a tab stop of its own and never a stray focus ring.
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] border border-border shadow-soft transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-luxury group-hover:border-primary/60">
              <div className="absolute inset-0 transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]">
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
              "min-w-0 text-right",
              photoRight ? "lg:order-2" : "lg:order-1"
            )}
          >
            {/* Folio numeral with a rule running off it — the index device that
                repeats down the page and sets the rhythm. */}
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="font-display text-[46px] lg:text-[58px] leading-none tabular-nums text-primary/70 transition-colors duration-500 group-hover:text-primary"
              >
                {folio(index + 1)}
              </span>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-primary/25 transition-colors duration-500 group-hover:bg-primary/50"
              />
            </div>

            <h2 className="font-display font-normal text-[22px] leading-snug text-foreground mt-6 transition-colors duration-300 group-hover:text-accent">
              {p.name}
            </h2>

            {/* The four values plus their rules run past 335px at 375px wide,
                so this line wraps. Each rule therefore travels INSIDE the item
                it follows: a wrap can now only ever leave a rule at the end of
                a line (the left margin in RTL, where it reads as a
                continuation tick) and never orphan one at the right margin
                where the eye starts the next line. */}
            <div className="mt-4 flex flex-wrap items-center gap-y-2 text-[18px] text-muted-foreground">
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

            <p className="mt-6 text-[20px] leading-relaxed text-foreground text-pretty">
              {p.intro}
            </p>

            {/* Rule grows from the right (the RTL start) on row hover. */}
            <span className="inline-block mt-8">
              <span className="inline-flex items-center gap-2 text-[18px] text-accent">
                לצפייה בפרויקט
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
  const { value, setValue, activeCount } = useFilterParams(["type", "area"]);
  const selectedTypes = value.type;
  const selectedAreas = value.area;

  const visible = useMemo(
    () =>
      projects.filter(
        (p) =>
          (!selectedTypes.length || selectedTypes.includes(p.tag)) &&
          (!selectedAreas.length || selectedAreas.includes(p.location))
      ),
    [selectedTypes, selectedAreas]
  );

  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        key: "type",
        label: "סוג מרחב",
        options: uniqueSorted(projects.map((p) => p.tag)).map((tag) => ({
          value: tag,
          label: tag,
          count: projects.filter((p) => p.tag === tag).length,
        })),
      },
      {
        key: "area",
        label: "אזור",
        options: uniqueSorted(projects.map((p) => p.location)).map((loc) => ({
          value: loc,
          label: loc,
          count: projects.filter((p) => p.location === loc).length,
        })),
      },
    ],
    []
  );

  const clearFilters = useCallback(
    () => setValue({ type: [], area: [] }),
    [setValue]
  );

  return (
    <Layout>
      <SEO
        title="פרויקטים | סלוני חוץ בוילות, פנטהאוזים ובתי יוקרה | Aluma"
        description="מבחר פרויקטים נבחרים של Aluma, סלוני חוץ, מרפסות פנורמיות, מתחמי בריכה ופינות אירוח בעיצוב אישי. עבודות בוילות, פנטהאוזים ובתים פרטיים בישראל."
        path="/projects"
        jsonLd={collectionSchema}
      />
      <PageHero
        title="פרויקטים"
        subtitle="מבחר עבודות שתכננו, ייצרנו והרכבנו: מרפסות פנורמיות, גגות עירוניים, חצרות משפחתיות ומתחמי בריכה."
        filterSlot={
          <FilterSidebar
            groups={filterGroups}
            value={value}
            onChange={setValue}
            activeCount={activeCount}
            resultCount={visible.length}
          />
        }
      />

      {/* CONTENTS STRIP — the table of contents of the portfolio. A sand band
          that scrolls sideways on phones and wraps on desktop. */}
      {visible.length > 0 && (
        <section className="mt-10 md:mt-12 bg-secondary border-y border-border/70">
          <div className="container-luxury py-6 md:py-7">
            <nav
              aria-label="מפתח הפרויקטים"
              className="rail-scroll flex md:flex-wrap items-center gap-x-7 gap-y-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0"
            >
              <span className="shrink-0 text-[18px] text-muted-foreground">
                {activeCount > 0
                  ? `מציגים ${visible.length} מתוך ${projects.length} פרויקטים`
                  : "מפתח הפרויקטים"}
              </span>
              <MetaRule />

              {/* Charcoal ink, not terracotta. This band is sand, and both the
                  palette note in SectionHeading and the measured contrast say
                  terracotta only carries on warm white — text-accent on
                  bg-secondary lands around 3.3:1, under AA for 18px. The
                  terracotta stays where it belongs here: in the rules. */}
              {visible.map((p, i) => (
                <a
                  key={p.slug}
                  href={`#${p.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    jumpToEntry(p.slug);
                  }}
                  className="group shrink-0 inline-flex items-baseline gap-2"
                >
                  <span className="font-display text-[18px] tabular-nums text-foreground/70 transition-colors duration-300 group-hover:text-foreground">
                    {folio(i + 1)}
                  </span>
                  {/* Underline grows from the right — the RTL start — matching
                      the .link-underline grammar used site-wide. */}
                  <span className="relative text-[18px] text-foreground">
                    {p.name}
                    <span
                      aria-hidden="true"
                      className="absolute right-0 -bottom-1 h-px w-0 bg-foreground/60 transition-[width] duration-300 ease-out group-hover:w-full"
                    />
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </section>
      )}

      {/* THE INDEX */}
      <section className="bg-background pb-6 md:pb-10">
        <div className="container-luxury">
          {visible.length === 0 ? (
            <Reveal className="max-w-xl mx-auto text-center py-24 md:py-32">
              <p className="text-[20px] leading-relaxed text-foreground-soft">
                אין פרויקטים שמתאימים לסינון שבחרתם.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 text-[18px] text-accent link-underline transition-smooth"
              >
                נקה את הסינון
              </button>
            </Reveal>
          ) : (
            <div className="divide-y divide-border">
              {visible.map((p, i) => (
                <ProjectEntry key={p.slug} project={p} index={i} />
              ))}
            </div>
          )}
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
