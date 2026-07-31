import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";

import { useProject } from "@/hooks/useProjectsData";
import { ArrowLeft, ArrowRight, Check, MapPin, Calendar, Maximize2 } from "lucide-react";
import NotFound from "./NotFound";

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const { project, projects, loading } = useProject(slug);

  // Don't render a 404 while the CMS query is still in flight — the fallback
  // list is in place from the first paint, so this only guards the moment a
  // CMS-only slug is being resolved.
  if (!project) {
    if (loading) {
      return (
        <Layout>
          <div className="min-h-[60vh] flex items-center justify-center text-[20px] text-muted-foreground">
            טוען…
          </div>
        </Layout>
      );
    }
    return <NotFound />;
  }

  const others = projects.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <Layout>
      <SEO
        title={`${project.name} | פרויקטים | Aluma`}
        description={project.intro}
        path={`/projects/${project.slug}`}
        image={project.cover}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: project.name,
            description: project.intro,
            image: project.cover,
            inLanguage: "he-IL",
            mainEntityOfPage: `https://alumaoutdoor.com/projects/${project.slug}`,
            publisher: { "@type": "Organization", name: "Aluma" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "בית", item: "https://alumaoutdoor.com/" },
              { "@type": "ListItem", position: 2, name: "פרויקטים", item: "https://alumaoutdoor.com/projects" },
              { "@type": "ListItem", position: 3, name: project.name, item: `https://alumaoutdoor.com/projects/${project.slug}` },
            ],
          },
        ]}
      />

      {/* BACK LINK — ArrowRight is the "back" direction in RTL. */}
      <section className="bg-background pt-24 md:pt-28 pb-6 md:pb-10">
        <div className="container-luxury">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 text-[18px] text-muted-foreground hover:text-primary transition-smooth"
          >
            <ArrowRight
              className="w-[18px] h-[18px] transition-transform duration-300 ease-out group-hover:translate-x-1"
              aria-hidden="true"
            />
            חזרה לפרויקטים
          </Link>
        </div>
      </section>

      {/* MAIN 2-COLUMN */}
      <section className="pb-16 md:pb-24 bg-background">
        <div className="container-luxury grid md:grid-cols-5 gap-8 md:gap-12 items-start">
          {/* RIGHT COLUMN, text */}
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="mb-8 md:mb-10">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight mb-4 text-primary">
                {project.name}
              </h1>
              {/* No italic: Assistant ships no true Hebrew italic, so the browser
                  fakes an oblique that slants the letterforms badly. The lead
                  reads at 20px in the softer charcoal instead. */}
              <p className="text-[20px] leading-relaxed text-foreground-soft text-pretty mb-6">
                {project.intro}
              </p>
              {/* Each chip is conditional: projects entered through the CMS
                  carry no year or area, and an icon with nothing beside it
                  reads as a rendering fault. */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[18px] text-muted-foreground">
                {project.location && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-[18px] h-[18px] text-accent shrink-0" aria-hidden="true" />
                    {project.location}
                  </span>
                )}
                {project.year && (
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="w-[18px] h-[18px] text-accent shrink-0" aria-hidden="true" />
                    {project.year}
                  </span>
                )}
                {project.area && (
                  <span className="inline-flex items-center gap-2">
                    <Maximize2 className="w-[18px] h-[18px] text-accent shrink-0" aria-hidden="true" />
                    {project.area}
                  </span>
                )}
              </div>
            </div>

            {project.story.length > 0 && (
            <div className="border border-border rounded-[14px] p-6 md:p-8 mb-6 md:mb-8">
              <h2 className="font-display font-bold text-[26px] leading-snug text-primary">
                על הפרויקט
              </h2>
              <div className="w-20 h-[2px] bg-primary/55 mt-5" aria-hidden="true" />
              {/* The paragraphs used to render with no gap between them and ran
                  together as one block. */}
              <div className="mt-6 space-y-4">
                {project.story.map((p, i) => (
                  <p key={i} className="text-foreground text-body">
                    {p}
                  </p>
                ))}
              </div>
            </div>
            )}

            {/* The whole panel is conditional. A CMS project carries neither
                scope nor materials, and an empty bordered box with two headings
                and nothing under them looks broken rather than sparse. */}
            {(project.scope.length > 0 || project.materials.length > 0) && (
            <div className="border border-border rounded-[14px] p-6 md:p-8">
              <h2 className="font-display font-bold text-[26px] leading-snug text-primary">
                הפרויקט כולל
              </h2>
              <div className="w-20 h-[2px] bg-primary/55 mt-5" aria-hidden="true" />
              <ul className="mt-6 space-y-4 mb-8">
                {project.scope.map((s) => (
                  <li key={s} className="flex gap-3 text-[18px] leading-relaxed text-foreground">
                    <Check className="w-[18px] h-[18px] text-accent mt-[6px] shrink-0" aria-hidden="true" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              {project.materials.length > 0 && (
              <div className="pt-6 border-t border-border">
                <h3 className="font-display font-normal text-[22px] text-foreground">
                  חומרים
                </h3>
                <div className="mt-4 space-y-2 text-[18px] leading-relaxed text-foreground">
                  {project.materials.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"
                        aria-hidden="true"
                      />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
            )}
          </div>

          {/* LEFT COLUMN, images */}
          <div className="md:col-span-3 order-1 md:order-2">
            <div className="rail-scroll flex md:flex-col overflow-x-auto md:overflow-visible gap-4 md:gap-6 snap-x md:snap-none -mx-5 px-5 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 pb-3 md:pb-0">
              {project.gallery.map((img, i) => (
                <div
                  key={i}
                  className="group shrink-0 md:shrink snap-start w-[85%] sm:w-[60%] md:w-full"
                >
                  <div className="relative overflow-hidden rounded-[14px] border border-border shadow-soft aspect-[4/3] transition-colors duration-500 ease-out group-hover:border-primary/60">
                    <img
                      src={img}
                      alt={`${project.name}, תמונה ${i + 1}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.06]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA — sand band, so the title runs charcoal (terracotta only carries on warm white). */}
      <section className="py-20 md:py-24 gradient-cream">
        <div className="container-luxury">
          <div className="flex flex-col items-center text-center">
            <p className="text-[18px] text-muted-foreground mb-4">מגשימים חלום</p>
            <SectionHeading
              tone="charcoal"
              subtitle="כל פרויקט מתוכנן ומיוצר בהתאם לאופי המרחב עד לפרטים הקטנים ביותר."
            >
              השאירו פרטים
            </SectionHeading>
            <div className="mt-9">
              <ShineButton to="/contact">
                להשארת פרטים
                <ArrowLeft className="w-[18px] h-[18px]" aria-hidden="true" />
              </ShineButton>
            </div>
          </div>
        </div>
      </section>

      {/* MORE PROJECTS */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-luxury">
          <div className="flex flex-col items-center text-center mb-10 md:mb-12">
            <h2 className="font-display font-bold text-[26px] leading-snug text-primary">
              פרויקטים נוספים
            </h2>
            <div className="w-20 h-[2px] bg-primary/55 mt-5" aria-hidden="true" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {others.map((p) => (
              <Link key={p.slug} to={`/projects/${p.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] border border-border mb-4 shadow-soft transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-luxury group-hover:border-primary/60">
                  <img
                    src={p.cover}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <h3 className="font-display font-normal text-[22px] text-foreground group-hover:text-accent transition-smooth flex items-center gap-2">
                  {p.name}
                  <ArrowLeft
                    className="w-[18px] h-[18px] shrink-0 transition-transform duration-300 ease-out group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectDetailPage;
