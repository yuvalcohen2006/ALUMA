import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Reveal from "@/components/Reveal";
import TileCard from "@/components/TileCard";
import { useProjects } from "@/hooks/useProjectsData";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteText } from "@/hooks/useSiteText";

const MAX = 3;

/**
 * Three projects, then the offer.
 *
 * The three tiles are plain and identical. A dissolve on the third belongs on
 * the projects page, where it closes a list that has genuinely ended — here it
 * only made one of three tiles look broken, since the sentence underneath is
 * already doing the work of saying there is more.
 *
 * The words carry it instead: "and many others", then the invitation, then the
 * two ways out — the conversation first, the full portfolio second.
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
