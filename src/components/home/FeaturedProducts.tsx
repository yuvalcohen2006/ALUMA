import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import TileCard from "@/components/TileCard";
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
        <ul
          role="list"
          className="tile-grid mt-10 grid grid-cols-2 gap-x-6 gap-y-12 md:mt-14 md:gap-y-16 lg:grid-cols-3"
        >
          {shown.map((p, i) => (
            <li key={p.id}>
              <Reveal delay={(i % 3) * 70}>
                <TileCard
                  to={to(`/products/${p.slug}`)}
                  image={p.cover_url}
                  alt=""
                  title={p.name}
                  meta={p.tagline}
                  aspect="4/5"
                  eager={i < 3}
                />
              </Reveal>
            </li>
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
