import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { materials, type Material } from "@/data/materials";

/**
 * One material, one compact card.
 *
 * The page runs charcoal end to end — the same inversion the materials rail
 * uses on the home screen, where the one dark section is what makes the whole
 * page feel expensive. Cards are deliberately small: a short photo, the name,
 * a line of explanation and the four qualities, nothing else. The whole card is
 * the link, so there is no button to carry.
 *
 * At rest each card is tinted by the colour of its own material. On hover it
 * lifts a little and desaturates towards grey, so the one you're pointing at
 * reads as picked up and the rest stay put.
 */
const MaterialCard = ({ material }: { material: Material }) => (
  <Link
    to={`/materials/${material.slug}`}
    className="group block rounded-[14px] border overflow-hidden bg-background/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-background/25 hover:bg-background/[0.07] hover:shadow-luxury"
    style={{ borderColor: material.accent }}
  >
    {/* Deliberately a short banner, not a big square — the card has to stay
        small, and the four qualities below already carry the height. */}
    <div className="relative aspect-[2/1] overflow-hidden">
      <img
        src={material.image}
        alt={material.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:saturate-[0.35] group-hover:brightness-[0.85]"
      />
    </div>

    <div className="p-5 text-right">
      <h2 className="font-display text-[26px] leading-snug text-background">
        {material.name}
      </h2>
      <p className="text-[20px] leading-relaxed text-background/70 mt-1.5">
        {material.shortDesc}
      </p>

      <ul className="mt-4 space-y-2.5">
        {material.features.map((f) => (
          <li key={f.title} className="flex flex-row gap-3 items-start">
            <Check
              className="w-4 h-4 mt-1.5 shrink-0 transition-colors duration-300 group-hover:text-background/50"
              style={{ color: material.accent }}
              strokeWidth={2.5}
            />
            <div>
              <p className="text-[18px] font-normal text-background leading-snug">
                {f.title}
              </p>
              <p className="text-[18px] italic text-background/55 leading-snug">
                {f.desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </Link>
);

const MaterialsPage = () => {
  return (
    <Layout>
      <SEO
        title="חומרים | בדי Sunbrella, אלומיניום ושיש גרניט פורצלן | Aluma"
        description="החומרים שמהם עשויים מוצרי Aluma: בדי Sunbrella עמידים ל-UV, אלומיניום פרימיום בציפוי אבקה ושיש גרניט פורצלן בעיבוד יד, לעמידות יוקרה לאורך שנים."
        path="/materials"
      />

      <PageHero title="חומרים" dark />

      <section className="pt-12 pb-20 md:pt-16 md:pb-28 bg-foreground">
        <div className="container-luxury">
          <Reveal>
            <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
              {materials.map((m) => (
                <MaterialCard key={m.slug} material={m} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default MaterialsPage;
