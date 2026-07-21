import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";
import BeforeAfter from "@/components/BeforeAfter";
import { beforeAfterItems } from "@/data/beforeAfter";
import { MapPin, ArrowLeft } from "lucide-react";

const BeforeAfterPage = () => {
  return (
    <Layout>
      <SEO
        title="לפני ואחרי | טרנספורמציות חוץ של Aluma"
        description="גלריית לפני ואחרי, מרפסות, חצרות וגגות שהפכנו לסלוני חוץ יוקרתיים. החליקו לראות את השינוי."
        path="/before-after"
      />

      <section className="pt-32 pb-12 md:pt-40 md:pb-16 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="לפני ואחרי" en="Before & After" className="text-xs mb-5" />
          <h1 className="font-display text-3xl md:text-5xl text-primary font-light tracking-wide mb-6">
            החליקו לראות את השינוי
          </h1>
          <div className="w-16 h-px bg-primary/30 mx-auto mb-6" />
          <p className="max-w-2xl mx-auto text-muted-foreground font-light leading-relaxed">
            כל פרויקט מתחיל בחלל ריק, ונגמר במרחב חיים. גררו את הידית בכל תמונה כדי לראות את המסע.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container-luxury">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {beforeAfterItems.map((item) => (
              <article key={item.id} className="space-y-5">
                <BeforeAfter
                  before={item.before}
                  after={item.after}
                  beforeAlt="לפני"
                  afterAlt="אחרי"
                />
                <div>
                  <div className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    {item.location} · {item.tag}
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl text-primary font-light mb-3">
                    {item.title}
                  </h2>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default BeforeAfterPage;
