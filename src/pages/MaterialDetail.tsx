import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";


import { getMaterial } from "@/data/materials";
import { ArrowRight, Check } from "lucide-react";
import NotFound from "./NotFound";

const MaterialDetailPage = () => {
  const { slug } = useParams();
  const material = slug ? getMaterial(slug) : undefined;
  if (!material) return <NotFound />;

  const jsonLdGraph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "בית", item: "https://alumaoutdoor.com/" },
        { "@type": "ListItem", position: 2, name: "חומרים", item: "https://alumaoutdoor.com/materials" },
        { "@type": "ListItem", position: 3, name: material.name, item: `https://alumaoutdoor.com/materials/${material.slug}` },
      ],
    },
  ];
  if (material.faq && material.faq.length > 0) {
    jsonLdGraph.push({
      "@type": "FAQPage",
      mainEntity: material.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return (
    <Layout>
      <SEO
        title={`${material.name} | חומרים לריהוט חוץ | Aluma`}
        description={material.shortDesc}
        path={`/materials/${material.slug}`}
        image={material.image}
        jsonLd={{ "@context": "https://schema.org", "@graph": jsonLdGraph }}
      />

      {/* HERO */}
      <section className="relative pt-24 md:pt-28 bg-background">
        <div className="relative h-[42vh] min-h-[280px] md:h-[75vh] md:min-h-[560px] overflow-hidden">
          <img
            src={material.image}
            alt={material.name}
            width={1920}
            height={1280}
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 md:p-16">
            <div className="container-luxury text-primary-foreground">
              <h1 className="font-display text-4xl md:text-6xl font-light leading-tight mb-4 max-w-3xl">
                {material.name}
              </h1>
              <p className="text-base md:text-lg font-light opacity-95 max-w-2xl">
                {material.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="py-16 md:py-24 bg-background">
        <div className="container-luxury grid md:grid-cols-5 gap-12 items-stretch">
          <div className="md:col-span-3 border border-primary/40 rounded-sm p-8 flex flex-col">
            <div className="space-y-6">
              {material.longDesc.map((p, i) => (
                <p key={i} className="text-foreground/85 font-light leading-loose text-[16px]">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <aside className="md:col-span-2 border border-primary/40 rounded-sm p-8 flex flex-col">
            <div className="text-[11px] tracking-[0.4em] uppercase text-accent mb-6">
              מאפיינים
            </div>
            <ul className="space-y-3">
              {material.features.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <Check className="w-4 h-4 text-accent mt-1 shrink-0" />
                  <div className="text-primary font-light text-[15px] leading-relaxed">
                    {f.title}{f.desc && <span className="text-muted-foreground"> — {f.desc}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {material.faq && material.faq.length > 0 && (
        <section className="py-16 md:py-24 gradient-cream">
          <div className="container-luxury max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">
                שאלות ותשובות
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-primary mb-3">
                מה שחשוב לדעת על {material.name}
              </h2>
              <div className="w-16 h-px bg-primary/30 mx-auto" />
            </div>
            <div className="space-y-4">
              {material.faq.map((f, i) => (
                <details
                  key={i}
                  className="group bg-background border border-border rounded-sm p-6 open:shadow-soft transition-smooth"
                >
                  <summary className="cursor-pointer flex items-start justify-between gap-4 font-display text-lg text-primary list-none [&::-webkit-details-marker]:hidden">
                    <span className="flex-1">{f.q}</span>
                    <span className="shrink-0 w-6 h-6 rounded-full border border-primary/40 flex items-center justify-center text-primary text-lg leading-none transition-smooth group-open:rotate-45 group-open:bg-accent group-open:border-accent group-open:text-accent-foreground">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-[15px] leading-loose text-muted-foreground font-light">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}


      <div className="pb-16 flex justify-center">
        <Link
          to="/materials"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary hover:bg-primary hover:text-primary-foreground transition-smooth rounded-full px-8 py-3"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה לחומרים
        </Link>
      </div>

    </Layout>
  );
};

export default MaterialDetailPage;
