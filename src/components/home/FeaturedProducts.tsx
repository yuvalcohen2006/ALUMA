import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import TileCard from "@/components/TileCard";
import { useCollections } from "@/hooks/useCollectionsData";
import { useHomeHighlights } from "@/hooks/useHomeHighlights";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useTranslation } from "react-i18next";
import { useSiteText } from "@/hooks/useSiteText";
import { localizedName } from "@/lib/localized-name";
import { capEmblems, resolveEmblems, isEmblem } from "@/lib/emblems";
import StockNote from "@/components/home/StockNote";

/**
 * Three pieces, chosen in the admin, shown large.
 *
 * It was six, and they were not chosen — the strip took whatever the database
 * returned first, which on a tie-heavy sort_order could differ between two
 * visits. Three picked pieces at nearly double the size is a different claim
 * from six arbitrary ones: this is what we would like you to look at, rather
 * than here is some stock.
 *
 * Square, not the 4:5 they used to be. Product covers are cropped square on
 * upload, so a square tile is the one shape that shows exactly what the owner
 * framed — the old 4:5 was quietly cutting the sides off every one of them.
 */
const FeaturedProducts = () => {
  const { products, loading } = useCollections();
  const { highlights, loading: picking } = useHomeHighlights(products);
  const { to, lang } = useLocalizedPath();
  const t = useSiteText();
  const { t: tr } = useTranslation("home");

  if (loading || picking || highlights.length === 0) return null;

  // Resolved against the WHOLE catalogue, not just these three: "new" means
  // new among everything Aluma sells, and computing it from a slice of three
  // would make one of any three the newest.
  const resolved = resolveEmblems(products);
  // At most one across the three. On a strip this short a second makes two
  // thirds of the row "special", which is no signal at all.
  const emblems = capEmblems(highlights, (p) => resolved.get(p.id), 1, (p) => isEmblem(p.emblem));

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28 lg:px-16 lg:py-36">
        <Reveal>
          <h2 className="text-start text-heading font-normal tracking-normal text-foreground">
            {t("home.products.title", tr("products.title"))}
          </h2>
        </Reveal>

        <ul
          role="list"
          className="tile-grid tile-soften mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-3 md:mt-14"
        >
          {highlights.map((p, i) => (
            <li key={p.id}>
              <Reveal delay={i * 70}>
                <TileCard
                  to={to(`/products/${p.slug}`)}
                  image={p.cover_url}
                  alt=""
                  title={localizedName(lang, p.name, p.name_en)}
                  meta={p.tagline}
                  aspect="square"
                  eager={i === 0}
                  emblem={emblems[i]}
                  // Outside the link, so "only 3 left" is read after the
                  // piece's name rather than becoming part of it.
                  extra={<StockNote stock={p.stock} />}
                />
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal>
          <div className="mt-12 text-start">
            <Link
              to={to("/collections")}
              className="text-small text-foreground underline decoration-1 underline-offset-[6px] transition-colors hover:text-accent"
            >
              {tr("products.all")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FeaturedProducts;
