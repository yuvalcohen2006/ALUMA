import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";
import { materials } from "@/data/materials";
import { ArrowLeft } from "lucide-react";

const MaterialsPage = () => {
  return (
    <Layout>
      <SEO
        title="חומרים | בדי Sunbrella, אלומיניום ושיש גרניט פורצלן | Aluma"
        description="החומרים שמהם עשויים מוצרי Aluma: בדי Sunbrella עמידים ל-UV, אלומיניום פרימיום בציפוי אבקה ושיש גרניט פורצלן בעיבוד יד, לעמידות יוקרה לאורך שנים."
        path="/materials"
      />

      <section className="pt-32 pb-12 md:pt-40 md:pb-16 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="חומרים" en="Materials" className="text-xs mb-5" />
          <h1 className="font-display text-3xl md:text-5xl text-foreground font-light tracking-wide mb-6">
            החומרים שבונים את האיכות
          </h1>
          <div className="w-16 h-px bg-primary/30 mx-auto mb-6" />
          <p className="max-w-2xl mx-auto text-muted-foreground font-normal leading-relaxed">
            כל מוצר של Aluma מתחיל בבחירה קפדנית של חומר, שמרגיש יוקרתי במגע, ונשאר יפה גם אחרי שנים בחוץ.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container-luxury space-y-20 md:space-y-28">
          {materials.map((m, i) => {
            const reverse = i % 2 === 1;
            return (
              <Link
                key={m.slug}
                to={`/materials/${m.slug}`}
                className="group grid md:grid-cols-2 gap-10 md:gap-16 items-center"
              >
                <div
                  className={`relative overflow-hidden rounded-sm shadow-luxury aspect-[4/3] ${
                    reverse ? "md:order-2" : ""
                  }`}
                >
                  <img
                    src={m.image}
                    alt={m.name}
                    width={1280}
                    height={960}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
                </div>

                <div className={reverse ? "md:order-1" : ""}>
                  <div className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">
                    {String(i + 1).padStart(2, "0")}, Material
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl text-primary font-light mb-3 leading-tight">
                    {m.name}
                  </h2>
                  <div className="text-accent font-light italic mb-6">
                    {m.tagline}
                  </div>
                  <p className="text-muted-foreground font-normal leading-relaxed mb-8 text-[15px]">
                    {m.shortDesc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-foreground text-sm tracking-[0.2em] uppercase border-b border-primary/40 pb-1 group-hover:border-primary group-hover:text-primary transition-smooth">
                    גלו את החומר
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </Layout>
  );
};

export default MaterialsPage;
