import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { materials } from "@/data/materials";
import { useLocalizedPath } from "@/lib/useLocalizedPath";

const JournalPage = () => {
  const { to } = useLocalizedPath();

  return (
    <Layout>
      <SEO
        title="שווה לדעת | Aluma"
        description="החומרים שמהם עשוי ריהוט החוץ שלנו, ומה שכדאי לדעת לפני שבוחרים ריהוט שנשאר בחוץ כל השנה."
        path="/journal"
      />

      <PageHero
        title="שווה לדעת"
        subtitle="מה שכדאי לדעת לפני שבוחרים ריהוט שנשאר בחוץ כל השנה."
      />

      {/* Materials get a card each, linking to the page that actually
          explains them. The client called this page "a side thing", so it
          points at the good content rather than trying to be it. */}
      <section className="bg-background">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16 pb-20 md:pb-28">
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {materials.map((m, i) => (
              <Reveal key={m.slug} delay={(i % 4) * 70}>
                <li>
                  <Link to={to(`/materials/${m.slug}`)} className="group block text-start">
                    <div className="aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={m.image}
                        alt={m.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
                      />
                    </div>
                    <h3 className="mt-4 text-small text-foreground">{m.name}</h3>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>

          <div className="mt-12 text-start">
            <Link
              to={to("/materials")}
              className="text-small text-foreground underline underline-offset-[6px] decoration-1 hover:text-accent transition-colors"
            >
              עוד על החומרים
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default JournalPage;
