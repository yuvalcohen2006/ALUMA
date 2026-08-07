import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionRule from "@/components/SectionRule";
import { materials } from "@/data/materials";
import { useProjects } from "@/hooks/useProjectsData";
import { useLocalizedPath } from "@/lib/useLocalizedPath";

const JournalPage = () => {
  const { to } = useLocalizedPath();
  const { projects } = useProjects();

  return (
    <Layout>
      <SEO
        title="שווה לדעת | Aluma"
        description="החומרים שמהם עשוי ריהוט החוץ שלנו, והפרויקטים שהם הפכו להיות. מה שכדאי לדעת לפני שבוחרים ריהוט חוץ."
        path="/journal"
      />

      <PageHero
        title="שווה לדעת"
        subtitle="מהחומרים עצמם ועד המרחבים שהם הפכו להיות — מה שכדאי לדעת לפני שבוחרים ריהוט שנשאר בחוץ כל השנה."
      />

      {/* MATERIALS — the home page's tile language, at half scale: the
          photograph IS the card, two to a row, the name sitting top-centre on
          the same light scrim the morning tiles use. No fade into the page,
          no panel, no chrome. */}
      <section className="pb-8 bg-background">
        <div className="container-luxury">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {materials.map((m, i) => (
              <Reveal key={m.slug} delay={(i % 2) * 80}>
                <li>
                  <Link
                    to={to(`/materials/${m.slug}`)}
                    className="group relative block h-[240px] md:h-[280px] overflow-hidden rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring"
                  >
                    <img
                      src={m.image}
                      alt={m.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-2/3"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.28) 55%, transparent 100%)",
                      }}
                    />
                    <div className="relative z-10 text-center px-6 pt-7 text-foreground">
                      <h3 className="font-display font-semibold text-[24px] md:text-[28px] leading-tight">
                        {m.name}
                      </h3>
                      <p className="mt-1 text-[16px] md:text-[17px] leading-snug text-foreground-soft">
                        {m.tagline}
                      </p>
                    </div>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* PROJECTS — the other half of "worth knowing": what the materials
          actually became. Kept to a preview here; the full numbered index
          lives on its own page. */}
      <section className="section-pad bg-background">
        <div className="container-luxury">
          <Reveal>
            <h2 className="font-display font-bold text-[26px] md:text-[30px] text-primary text-start">
              פרויקטים
            </h2>
            <SectionRule on="light" variant="hairline" />
          </Reveal>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7">
            {projects.slice(0, 3).map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 70}>
                <li>
                  <Link to={to(`/projects/${p.slug}`)} className="group block text-start">
                    <div className="aspect-[4/3] overflow-hidden rounded-[14px] bg-secondary">
                      <img
                        src={p.cover}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </div>
                    <h3 className="mt-4 font-display text-[21px] leading-snug text-foreground decoration-1 underline-offset-4 group-hover:underline">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-[15px] text-foreground/55">
                      {[p.location, p.tag].filter(Boolean).join(" · ")}
                    </p>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal>
            <div className="mt-10 md:mt-12 text-center">
              <Link
                to={to("/projects")}
                className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-foreground/25 text-[17px] text-foreground transition-colors duration-200 hover:border-accent hover:text-accent"
              >
                לכל הפרויקטים
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </Layout>
  );
};

export default JournalPage;
