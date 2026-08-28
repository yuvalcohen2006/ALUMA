import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
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
    <section className="bg-secondary">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16 py-20 md:py-28 lg:py-36">
        <Reveal>
          <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
            {t("home.projects.title", "פרויקטים")}
          </h2>
        </Reveal>

        <ul className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-16">
          {shown.map((p, i) => (
            <Reveal key={p.slug} delay={i * 70}>
              <li>
                <Link to={to(`/projects/${p.slug}`)} className="group block text-start">
                  <div className="aspect-[3/2] overflow-hidden bg-muted">
                    <img
                      src={p.cover}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
                    />
                  </div>
                  <h3 className="mt-4 text-small text-foreground">{p.name}</h3>
                  {p.location && (
                    <p className="mt-1 text-label text-muted-foreground">{p.location}</p>
                  )}
                </Link>
              </li>
            </Reveal>
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
