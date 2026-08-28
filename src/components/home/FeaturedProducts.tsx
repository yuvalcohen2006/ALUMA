import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import { useCollections } from "@/hooks/useCollectionsData";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteText } from "@/hooks/useSiteText";

/** Six pieces, three across. Three columns rather than four: four reads dense,
 *  and density is the thing the client asked us to remove. */
const MAX = 6;

/**
 * A product card with TWO text elements.
 *
 * That count is the whole design. Measured across the references: Skargaarden
 * shows 3, we were showing 5 or more, NordicNest shows 6–7 — and that delta is
 * exactly what "loud" versus "calm" means on a listing. So: name, one
 * descriptor, nothing else. No price (made to order), no badge, no stock pill,
 * no rating, no add-to-cart.
 */
const FeaturedProducts = () => {
  const { products, loading } = useCollections();
  const { to } = useLocalizedPath();
  const t = useSiteText();
  const shown = products.slice(0, MAX);

  if (loading || shown.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16 py-20 md:py-28 lg:py-36">
        <Reveal>
          <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
            {t("home.products.title", "מוצרים נבחרים")}
          </h2>
        </Reveal>

        {/* gap-y is double gap-x on purpose: uneven vertical breathing is what
            makes a grid read as curated rather than dumped. */}
        <ul className="mt-10 md:mt-14 grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-y-16">
          {shown.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 70}>
              <li>
                <Link to={to(`/products/${p.slug}`)} className="group block text-start">
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    {p.cover_url && (
                      <img
                        src={p.cover_url}
                        alt={p.name}
                        loading={i < 3 ? "eager" : "lazy"}
                        decoding="async"
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
                      />
                    )}
                  </div>
                  <h3 className="mt-4 text-small text-foreground">{p.name}</h3>
                  {p.tagline && (
                    <p className="mt-1 text-label text-muted-foreground line-clamp-1">
                      {p.tagline}
                    </p>
                  )}
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <div className="mt-12 text-start">
            <Link
              to={to("/collections")}
              className="text-small text-foreground underline underline-offset-[6px] decoration-1 hover:text-accent transition-colors"
            >
              לכל המוצרים
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FeaturedProducts;
