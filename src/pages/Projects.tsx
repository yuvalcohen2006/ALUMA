import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";
import { projects } from "@/data/projects";
import { ArrowLeft, MapPin } from "lucide-react";

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

const ProjectsPage = () => {
  return (
    <Layout>
      <SEO
        title="פרויקטים | סלוני חוץ בוילות, פנטהאוזים ובתי יוקרה | Aluma"
        description="מבחר פרויקטים נבחרים של Aluma, סלוני חוץ, מרפסות פנורמיות, מתחמי בריכה ופינות אירוח בעיצוב אישי. עבודות בוילות, פנטהאוזים ובתים פרטיים בישראל."
        path="/projects"
        jsonLd={collectionSchema}
      />
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="פרויקטים" en="Projects" className="text-xs mb-5" />
          <h1 className="font-display text-3xl md:text-5xl text-foreground font-light tracking-wide mb-6">
            מבחר מרחבים שבנינו
          </h1>
          <div className="w-16 h-px bg-primary/30 mx-auto mb-6" />
          <p className="max-w-2xl mx-auto text-muted-foreground font-normal leading-relaxed">
            כל פרויקט הוא סיפור של מרחב, של אנשים ושל דרך חיים. הציצו פנימה, וכל אחד פותח עולם משלו.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container-luxury">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {projects.map((p, i) => (
              <Link
                key={p.slug}
                to={`/projects/${p.slug}`}
                className="group bg-card rounded-sm overflow-hidden shadow-soft hover:shadow-luxury hover:-translate-y-1 transition-smooth block"
              >
                <article>
                  <div className="aspect-[4/5] relative overflow-hidden bg-secondary">
                    <img
                      src={p.cover}
                      alt={`${p.name} | Aluma`}
                      width={1024}
                      height={1280}
                      loading={i < 3 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-primary/85 to-transparent text-primary-foreground">
                      <div className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase opacity-90">
                        <MapPin className="w-3 h-3" />
                        {p.location} · {p.year}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <h3 className="font-display text-xl md:text-2xl text-primary group-hover:text-accent transition-smooth">
                      {p.name}
                    </h3>
                    <ArrowLeft className="w-4 h-4 text-primary group-hover:text-accent transition-smooth" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectsPage;
