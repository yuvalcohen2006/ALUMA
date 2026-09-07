import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Reveal from "@/components/Reveal";
import TileCard from "@/components/TileCard";
import { useProjects } from "@/hooks/useProjectsData";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteText } from "@/hooks/useSiteText";

const MAX = 3;

/**
 * Three projects, the last one dissolving, and then the offer.
 *
 * The fade is doing a specific job: a row of exactly three finished tiles says
 * "here are three projects", and a row whose last tile runs out of the frame
 * says "here are three of them". That is the difference between a list and a
 * window, and it is why the closing line can be an invitation rather than a
 * navigation label.
 *
 * The mask lands on the photograph only. A mask clips its element's own focus
 * ring, so putting it on the link or the list item would leave a keyboard user
 * tabbing to a tile with no visible ring — see .tile-fade in index.css.
 *
 * The third project stays a real, clickable, focusable link. Faded is not
 * hidden: it is still in the document and still read aloud, so making it
 * unreachable by mouse while leaving it in the tab order would be worse than
 * either extreme.
 */
const ProjectsPreview = () => {
  const { projects } = useProjects();
  const { to } = useLocalizedPath();
  const t = useSiteText();
  const shown = projects.slice(0, MAX);

  if (shown.length === 0) return null;

  return (
    // Hairlined, like every tinted band: #F8F8F8 on white separates at 1.06:1,
    // where sand on cream managed 1.22:1.
    <section className="border-y border-border bg-secondary">
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28 lg:px-16 lg:py-36">
        <Reveal>
          <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
            {t("home.projects.title", "פרויקטים")}
          </h2>
        </Reveal>

        <ul
          role="list"
          className="tile-grid mt-10 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-3 md:mt-14"
        >
          {shown.map((p, i) => (
            <li key={p.slug}>
              <Reveal delay={i * 70}>
                <TileCard
                  to={to(`/projects/${p.slug}`)}
                  image={p.cover}
                  alt=""
                  title={p.name}
                  meta={p.location}
                  aspect="3/2"
                  fade={i === MAX - 1 && shown.length === MAX}
                />
              </Reveal>
            </li>
          ))}
        </ul>

        {/*
          The closing offer. It sits after the row rather than inside it because
          a fourth cell pretending to be a tile is a cell you have to explain;
          a sentence is a sentence.
        */}
        <Reveal>
          <div className="mt-14 max-w-[46ch] text-start md:mt-16">
            <p className="text-tile text-foreground">
              {t("home.projects.more", "ועוד רבים אחרים.")}
            </p>
            <p className="mt-2 text-body text-foreground-soft">
              {t("home.projects.invite", "הפרויקט הבא יכול להיות שלכם.")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              {/* The primary move is the conversation, not the catalogue of
                  work — someone reading this far has seen enough work. */}
              <Link
                to={to("/faq") + "#contact"}
                className="inline-flex h-12 items-center rounded-full bg-foreground px-7 text-small font-medium text-background transition-colors duration-200 hover:bg-accent"
              >
                {t("home.projects.cta", "דברו איתנו")}
              </Link>

              {/* Bigger than it was. This used to be a 16px text link sharing a
                  line with nothing; at 24px it is the second thing on the
                  block rather than a footnote to it. */}
              <Link
                to={to("/projects")}
                className="group inline-flex items-center gap-2 text-tile text-foreground underline decoration-1 underline-offset-[6px] transition-colors hover:text-accent"
              >
                {t("home.projects.all", "כל הפרויקטים")}
                <ArrowLeft
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="h-5 w-5 rotate-[var(--tile-arrow-flip)] transition-transform duration-250 ease-hover group-hover:translate-x-[var(--tile-arrow-travel)] motion-reduce:transition-none"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ProjectsPreview;
