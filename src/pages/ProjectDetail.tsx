import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";
import { Button } from "@/components/ui/button";

import { projects, getProject } from "@/data/projects";
import { ArrowLeft, ArrowRight, Check, MapPin, Calendar, Maximize2 } from "lucide-react";
import NotFound from "./NotFound";

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const project = slug ? getProject(slug) : undefined;
  if (!project) return <NotFound />;

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

      {/* BACK LINK */}
      <section className="bg-background pt-24 md:pt-28 pb-6 md:pb-10">
        <div className="container-luxury">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth"
          >
            <ArrowRight className="w-4 h-4" />
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
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-4 text-primary">
                {project.name}
              </h1>
              <p className="text-base md:text-lg italic font-light text-muted-foreground mb-6">
                {project.intro}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  {project.location}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  {project.year}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-accent" />
                  {project.area}
                </span>
              </div>
            </div>

            <div className="border border-primary/40 rounded-sm p-6 md:p-8 mb-6 md:mb-8">
              <SectionLabel he="על הפרויקט" en="About The Project" className="text-xs justify-start mb-5" />
              {project.story.map((p, i) => (
                <p key={i} className="text-foreground/85 font-light leading-loose text-[16px]">
                  {p}
                </p>
              ))}
            </div>

            <div className="border border-primary/40 rounded-sm p-6 md:p-8">
              <div className="text-[11px] tracking-[0.4em] uppercase text-accent mb-5">
                הפרויקט כולל
              </div>
              <ul className="space-y-4 mb-8">
                {project.scope.map((s) => (
                  <li key={s} className="flex gap-3">
                    <Check className="w-4 h-4 text-accent mt-1 shrink-0" />
                    <span className="text-primary font-light text-[15px]">{s}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-6 border-t border-border/60">
                <div className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
                  חומרים
                </div>
                <div className="text-primary font-light text-[15px] leading-relaxed space-y-1">
                  {project.materials.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN, images */}
          <div className="md:col-span-3 order-1 md:order-2">
            <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-4 snap-x md:snap-none -mx-6 px-6 md:mx-0 md:px-0 pb-2 md:pb-0">
              {project.gallery.map((img, i) => (
                <div
                  key={i}
                  className="shrink-0 md:shrink snap-start w-[85%] sm:w-[60%] md:w-full"
                >
                  <div className="relative overflow-hidden rounded-sm shadow-soft aspect-[4/3]">
                    <img
                      src={img}
                      alt={`${project.name}, תמונה ${i + 1}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover hover:scale-[1.03] transition-transform duration-[1200ms]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="מגשימים חלום" en="Your Space" className="text-xs mb-6" />
          <h2 className="font-display text-3xl md:text-5xl text-primary font-light mb-5 leading-tight">
            השאירו פרטים
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto mb-10 leading-relaxed">
            כל פרויקט מתוכנן ומיוצר בהתאם לאופי המרחב עד לפרטים הקטנים ביותר.
          </p>
          <Button asChild size="lg" className="rounded-sm tracking-wider">
            <Link to="/contact" className="inline-flex items-center gap-2">
              להשארת פרטים
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* MORE PROJECTS */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-luxury">
          <div className="text-[11px] tracking-[0.4em] uppercase text-accent mb-8 text-center">
            פרויקטים נוספים
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {others.map((p) => (
              <Link key={p.slug} to={`/projects/${p.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-4 shadow-soft">
                  <img
                    src={p.cover}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-display text-xl text-primary group-hover:text-accent transition-smooth flex items-center gap-2">
                  {p.name}
                  <ArrowLeft className="w-4 h-4" />
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
