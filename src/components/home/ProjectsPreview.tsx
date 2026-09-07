import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import TileCard from "@/components/TileCard";
import { useProjects } from "@/hooks/useProjectsData";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteText } from "@/hooks/useSiteText";

const MAX = 3;

/**
 * Projects, kept deliberately thin.
 *
 * Skargaarden's Rosewood Hong Kong page is two images and three sentences.
 * The proof is the client list itself, not a case study — so a card here is a
 * photograph, a name and a place, and nothing more.
 */
const ProjectsPreview = () => {
  const { projects } = useProjects();
  const { to } = useLocalizedPath();
  const t = useSiteText();
  const shown = projects.slice(0, MAX);

  if (shown.length === 0) return null;

  return (
    // Hairlined, like every tinted band now: #F8F8F8 on white separates at
    // 1.06:1, where sand on cream managed 1.22:1.
    <section className="border-y border-border bg-secondary">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16 py-20 md:py-28 lg:py-36">
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

        <Reveal>
          <div className="mt-12 text-start">
            <Link
              to={to("/projects")}
              className="text-small text-foreground underline underline-offset-[6px] decoration-1 hover:text-accent transition-colors"
            >
              כל הפרויקטים
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ProjectsPreview;
