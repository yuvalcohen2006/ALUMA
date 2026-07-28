import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
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

      <PageHero title="לפני ואחרי" />

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
                  <div className="flex items-center gap-2 text-[18px] text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    {item.location} · {item.tag}
                  </div>
                  <h2 className="font-display text-[22px] text-primary font-normal mb-3">
                    {item.title}
                  </h2>
                  <p className="text-foreground text-[20px] font-normal leading-relaxed">
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
