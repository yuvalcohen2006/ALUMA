import { useMemo } from "react";
import { formatPrice } from "@/lib/price";
import Ltr from "@/components/Ltr";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import TileCard from "@/components/TileCard";
import { localizedName } from "@/lib/localized-name";
import { capEmblems, resolveEmblems, type Emblem } from "@/lib/emblems";
import { useCollections, type DBProduct } from "@/hooks/useCollectionsData";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import NotFound from "./NotFound";
import { useTranslation } from "react-i18next";
import LoadError from "@/components/LoadError";

const SITE = "https://alumaoutdoor.com";

/**
 * One collection, all of its pieces.
 *
 * The middle level of the catalogue: /collections shows every range with a
 * single row of each, this shows one range in full, and /products/:slug is the
 * piece itself. Same card as the index so the two pages are visibly the same
 * system — tinted panel carries the radius, the card itself has no chrome.
 */
export const ProductCard = ({
  product: p,
  eager,
  emblem,
}: {
  product: DBProduct;
  eager: boolean;
  emblem?: Emblem | null;
}) => {
  const { to } = useLocalizedPath();
  const price = formatPrice(p.price);
  return (
    <TileCard
      to={to(`/products/${p.slug}`)}
      image={p.cover_url}
      alt=""
      title={p.name}
      meta={p.tagline}
      aspect="square"
      eager={eager}
      align="center"
      emblem={emblem}
      extra={
        (price || p.dimensions) && (
          <>
            {price && (
              <p className="mt-1.5 text-small text-foreground">
                {p.price_note && <span className="text-foreground-soft">{p.price_note} </span>}
                <span dir="ltr">{price}</span>
              </p>
            )}
            {p.dimensions && (
              <p className="mt-1.5 text-label text-foreground/45">
                {/* Dimensions stay LTR inside the RTL line, or the × and the
                    units end up on the wrong side. */}
                <Ltr>{p.dimensions}</Ltr>
              </p>
            )}
          </>
        )
      }
    />
  );
};

const CollectionPage = () => {
  const { slug } = useParams();
  const { collections, products, loading, error, reload } = useCollections();
  const { to, lang } = useLocalizedPath();

  const collection = collections.find((c) => c.slug === slug);
  const { t } = useTranslation("catalogue");
  const items = useMemo(
    () => (collection ? products.filter((p) => p.collection_id === collection.id) : []),
    [collection, products],
  );

  if (loading) {
    return (
      <Layout>
        <div className="container-luxury pt-40 pb-24">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-2/3 max-w-[420px] rounded-sm bg-secondary" />
            <div className="h-5 w-full max-w-[560px] rounded-sm bg-secondary" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-sm bg-secondary" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Order matters: a query error reaches here with an empty `collections`, and
  // `find` missing is exactly what a genuinely wrong slug looks like. Checked
  // first, a database outage no longer serves 404 + noindex for six real URLs.
  if (error) return <LoadError onRetry={reload} />;

  if (!collection) return <NotFound />;


  const name = localizedName(lang, collection.name_he, collection.name_en);
  // Two, not one: this grid runs to a dozen tiles, where a single mark is lost
  // rather than rare. Resolved across the whole catalogue so "new" is not
  // relative to whichever collection you happen to be looking at.
  const resolved = resolveEmblems(products);
  const emblems = capEmblems(items, (p) => resolved.get(p.id), 2);

  return (
    <Layout>
      <SEO
        title={`${name} | ${t("seo.collectionSuffix")}`}
        description={collection.intro || t("seo.collectionFallback", { name })}
        path={`/collections/${collection.slug}`}
        // The band photograph is gone; the first product is the
        // representative image for a share card now.
        image={collection.image_url || items[0]?.cover_url || undefined}
        jsonLd={{
"@context": "https://schema.org",
"@type": "CollectionPage",
          name,
          url: `${SITE}/collections/${collection.slug}`,
          // Was hardcoded he-IL, which told a crawler the English page was
          // Hebrew.
          inLanguage: lang === "he" ? "he-IL" : "en",
        }}
      />

      {/* A page header, not a hero. The 3:1 photograph that opened this page
          said nothing the products below do not say better, and it pushed the
          first real thing on the page below the fold. */}
      <section className="pt-36 pb-10 md:pt-44 md:pb-14">
        <div className="container-luxury">
          <h1 className="text-start text-display font-normal tracking-normal text-foreground">
            {name}
          </h1>

          {collection.intro && (
            <p className="mt-6 max-w-[62ch] text-start text-body leading-relaxed text-foreground-soft">
              {collection.intro}
            </p>
          )}

          <p className="mt-8 border-t border-foreground/12 pt-5 text-start text-small text-muted-foreground">
            {items.length} פריטים
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-luxury">
          {items.length === 0 ? (
            <p className="text-body text-muted-foreground text-start">בקרוב.</p>
          ) : (
            <ul
              role="list"
              className="tile-grid grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 md:gap-x-8 md:gap-y-14 lg:grid-cols-4"
            >
              {items.map((p, i) => (
                <li key={p.id}>
                  <Reveal delay={(i % 4) * 70}>
                    <ProductCard product={p} eager={i < 4} emblem={emblems[i]} />
                  </Reveal>
                </li>
              ))}
            </ul>
          )}

          <Reveal>
            <div className="mt-16 md:mt-20 text-center">
              <Link
                to={to("/collections")}
                className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-foreground/25 text-small text-foreground transition-colors duration-200 hover:border-accent hover:text-accent"
              >
                לכל הקולקציות
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default CollectionPage;
