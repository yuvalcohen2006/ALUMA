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
          {/* Charcoal scrim, not the old terracotta wash: --primary-foreground
              is charcoal, so dark type was sitting on a dark warm ground. This
              is the same gradient the materials rail uses on the home screen. */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/65 to-foreground/20" />
          <div className="absolute inset-x-0 bottom-0 p-8 md:p-16">
            <div className="container-luxury text-background">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight mb-4 max-w-3xl">
                {material.name}
              </h1>
              <p className="text-body leading-relaxed text-background/85 max-w-2xl">
                {material.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="py-16 md:py-24 bg-background">
        <div className="container-luxury grid md:grid-cols-5 gap-6 md:gap-8 items-stretch">
          <div className="md:col-span-3 rounded-sm border border-border bg-background  p-8 md:p-10 flex flex-col">
            <div className="space-y-6">
              {material.longDesc.map((p, i) => (
                <p key={i} className="text-foreground text-body">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <aside className="md:col-span-2 rounded-sm border border-border bg-background  p-8 md:p-10 flex flex-col">
            <h2 className="font-display font-medium text-heading leading-snug text-foreground">
              מאפיינים
            </h2>
            <div className="w-20 h-[2px] bg-foreground/15 mt-5" aria-hidden="true" />
            {/* Title and explanation on their own lines, the way the materials
                index sets them — the old comma-joined run was what forced the
                whole list down to 15px. */}
            <ul className="mt-7 space-y-5">
              {material.features.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <Check
                    className="w-5 h-5 text-primary mt-0.5 shrink-0"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-body font-normal leading-snug text-foreground">
                      {f.title}
                    </p>
                    {f.desc && (
                      <p className="text-body leading-snug text-muted-foreground mt-1.5">
                        {f.desc}
                      </p>
                    )}
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
            {/* Right-anchored like every other header on the site now, with the
                standard divider. The old centred micro-eyebrow is kept as a
                plain 18px label — charcoal, not terracotta, because this band
                is sand. */}
            <div className="text-start mb-10">
              <p className="text-body text-foreground-soft mb-2">
                שאלות ותשובות
              </p>
              <h2 className="font-display font-medium text-heading leading-snug text-foreground">
                מה שחשוב לדעת על {material.name}
              </h2>
              <div className="w-20 h-[2px] bg-foreground/15 mt-5" aria-hidden="true" />
            </div>
            <div className="border-t border-foreground/10">
              {material.faq.map((f, i) => (
                <details
                  key={i}
                  className="group border-b border-foreground/10 py-5"
                >
                  <summary className="cursor-pointer flex items-start justify-between gap-4 font-display font-normal text-body leading-snug text-foreground list-none [&::-webkit-details-marker]:hidden">
                    <span className="flex-1">{f.q}</span>
                    <span
                      className="shrink-0 w-6 h-6 flex items-center justify-center text-primary text-body leading-none transition-transform duration-300 group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-body leading-relaxed text-foreground-soft">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}


      <div className="py-16 md:py-20 bg-background flex justify-center">
        <Link
          to="/materials"
          className="inline-flex items-center gap-2.5 text-body font-normal text-primary border border-foreground/15 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth rounded-sm px-8 py-3.5"
        >
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
          חזרה לחומרים
        </Link>
      </div>

    </Layout>
  );
};

export default MaterialDetailPage;
