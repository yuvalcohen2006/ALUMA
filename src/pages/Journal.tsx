import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

      {/* MATERIALS — caption under the swatch, not over it.

          These cards used to wash a white gradient across the top two-thirds of
          each photograph to make room for the name. On a material sample that
          is self-defeating: the texture IS the content, and the scrim bleached
          exactly the part of it you were meant to be reading — the weave of the
          Sunbrella, the grain of the granite.

          How the surface houses actually do it, checked one by one: Cosentino
          Dekton, Farrow & Ball, Little Greene, Caesarstone and Laminam all set
          the name in a caption BELOW an untouched swatch. The single exception,
          Benjamin Moore, overlays its label — and can only afford to because
          its swatch is a flat block of colour rather than a photograph. Ours
          are photographs.

          So: a clean square crop, four across on a wide screen so they read as
          one set of four, and the name underneath where it costs the picture
          nothing. Separation is gap alone on the page colour — none of the five
          draws a border or a rule between cells either. */}
      <section className="pb-8 bg-background">
        <div className="container-luxury">
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 md:gap-x-6 gap-y-10">
            {materials.map((m, i) => (
              <Reveal key={m.slug} delay={(i % 4) * 70}>
                <li>
                  <Link
                    to={to(`/materials/${m.slug}`)}
                    className="group block rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-[14px] bg-secondary/40">
                      <img
                        src={m.image}
                        alt={m.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3 text-start">
                      <div className="min-w-0">
                        <h3 className="font-display font-semibold text-[20px] md:text-[22px] leading-tight text-foreground transition-colors duration-200 group-hover:text-accent">
                          {m.name}
                        </h3>
                        <p className="mt-1.5 text-[16px] leading-snug text-foreground-soft">
                          {m.tagline}
                        </p>
                      </div>
                      {/* Left is forward in Hebrew. */}
                      <ArrowLeft
                        className="mt-1.5 h-[18px] w-[18px] shrink-0 text-foreground-soft transition-all duration-200 group-hover:-translate-x-1 group-hover:text-accent"
                        aria-hidden="true"
                      />
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
