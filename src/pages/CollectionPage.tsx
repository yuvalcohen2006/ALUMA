import { useMemo } from "react";
import { formatPrice } from "@/lib/price";
import Ltr from "@/components/Ltr";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { useCollections, type DBProduct } from "@/hooks/useCollectionsData";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import NotFound from "./NotFound";

const SITE = "https://alumaoutdoor.com";

/**
 * One collection, all of its pieces.
 *
 * The middle level of the catalogue: /collections shows every range with a
 * single row of each, this shows one range in full, and /products/:slug is the
 * piece itself. Same card as the index so the two pages are visibly the same
 * system — tinted panel carries the radius, the card itself has no chrome.
 */
export const ProductCard = ({ product: p, eager }: { product: DBProduct; eager: boolean }) => {
  const { to } = useLocalizedPath();
  return (
    <Link to={to(`/products/${p.slug}`)} className="group block text-center">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary/50">
        {p.cover_url && (
          <img
            src={p.cover_url}
            alt={[p.name, p.tag].filter(Boolean).join(", ")}
            width={1024}
            height={1024}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
      </div>
      <h3 className="mt-5 font-display font-medium text-body leading-snug text-foreground transition-colors duration-300 group-hover:text-accent">
        {p.name}
      </h3>
      {p.tagline && (
        <p className="mt-1 text-small leading-relaxed text-muted-foreground text-pretty">
          {p.tagline}
        </p>
      )}
      {formatPrice(p.price) && (
        <p className="mt-1.5 text-small text-foreground">
          {p.price_note && <span className="text-foreground-soft">{p.price_note} </span>}
          <span dir="ltr">{formatPrice(p.price)}</span>
        </p>
      )}
      {p.dimensions && (
        <p className="mt-1.5 text-label text-foreground/45">
          {/* Dimensions stay LTR inside the RTL line, or the × and the units
              end up on the wrong side. */}
          <Ltr>{p.dimensions}</Ltr>
        </p>
      )}
    </Link>
  );
};

const CollectionPage = () => {
  const { slug } = useParams();
  const { collections, products, loading } = useCollections();
  const { to } = useLocalizedPath();

  const collection = collections.find((c) => c.slug === slug);
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

  if (!collection) return <NotFound />;


  return (
    <Layout>
      <SEO
        title={`${collection.name_he} | קולקציות | Aluma`}
        description={collection.intro || `קולקציית ${collection.name_he} של Aluma — ריהוט חוץ בייצור אישי.`}
        path={`/collections/${collection.slug}`}
        image={band || undefined}
        jsonLd={{
"@context": "https://schema.org",
"@type": "CollectionPage",
          name: collection.name_he,
          url: `${SITE}/collections/${collection.slug}`,
          inLanguage: "he-IL",
        }}
      />

      {/* A page header, not a hero. The 3:1 photograph that opened this page
          said nothing the products below do not say better, and it pushed the
          first real thing on the page below the fold. */}
      <section className="pt-36 pb-10 md:pt-44 md:pb-14">
        <div className="container-luxury">
          <h1 className="text-start text-display font-normal tracking-normal text-foreground">
            {collection.name_he}
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
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-14">
              {items.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 70}>
                  <li>
                    <ProductCard product={p} eager={i < 4} />
                  </li>
                </Reveal>
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
