import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { useCollections, type DBCollection, type DBProduct } from "@/hooks/useCollectionsData";
import { ProductCard } from "./CollectionPage";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteText } from "@/hooks/useSiteText";
import CategoryGrid from "@/components/CategoryGrid";

const SITE = "https://alumaoutdoor.com";

/**
 * The catalogue, as stacked collections on one page.
 *
 * The shape follows what the research actually found, not what a shop template
 * assumes. Apple's marketing lineup — image on a tinted panel, name, one-line
 * tagline, no chrome — is already a no-price pattern, which is exactly what a
 * made-to-order catalogue needs: adopt store-grid conventions (filter rail,
 * sort, badges) with the prices missing and the page reads as broken commerce
 * rather than curation. The curated houses go further: DEDON and Tribù ship
 * their collections with NO filters at all. Five collections of four products
 * don't need a drawer; they need a scroll.
 *
 * So: each collection opens on one wide photograph carrying its name in
 * white, shows a single row of pieces, and offers one way deeper. Grouping is
 * carried by unequal vertical rhythm — far more space between collections than
 * between rows — rather than by rules or boxes.
 */

/** How many pieces preview on the index before "show the whole range". */
const PREVIEW_COUNT = 4;

const CollectionSection = ({
  collection: col,
  products,
  first,
}: {
  collection: DBCollection;
  products: DBProduct[];
  first: boolean;
}) => {
  const { to } = useLocalizedPath();
  const band = col.image_url || products[0]?.cover_url || null;
  const preview = products.slice(0, PREVIEW_COUNT);
  const hasMore = products.length > PREVIEW_COUNT;

  return (
    <section id={col.slug} className="scroll-mt-32 py-14 md:py-24">
      {/* The photograph is a second, redundant click target for the heading
          below it. Hidden from assistive tech and skipped by the keyboard on
          purpose — otherwise every collection would announce two identical
          links, and tabbing the page would take twice as long for no gain. */}
      <Reveal>
        <Link
          to={to(`/collections/${col.slug}`)}
          aria-hidden="true"
          tabIndex={-1}
          className="group relative block aspect-[21/9] md:aspect-[3/1] overflow-hidden rounded-sm bg-secondary/50"
        >
          {band && (
            <img
              src={band}
              alt=""
              aria-hidden="true"
              loading={first ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </Link>
      </Reveal>

      {/* The name reads on the page, not out of the photograph. A 170px word
          over a darkened image was the loudest thing on the site, and the
          scrim it needed was fighting the picture underneath it. */}
      <Reveal>
        <h2 className="mt-5 text-start text-heading font-normal tracking-normal text-foreground">
          <Link to={to(`/collections/${col.slug}`)} className="hover:text-accent transition-colors">
            {col.name_he}
          </Link>
        </h2>
      </Reveal>

      {col.intro && (
        <Reveal>
          <p className="mt-6 md:mt-8 max-w-[62ch] text-body leading-relaxed text-foreground-soft text-start">
            {col.intro}
          </p>
        </Reveal>
      )}

      {preview.length > 0 && (
        <ul className="mt-9 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-12">
          {preview.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <li>
                <ProductCard product={p} eager={first && i < 4} />
              </li>
            </Reveal>
          ))}
        </ul>
      )}

      <Reveal>
        <div className="mt-10 md:mt-12 text-start">
          <Link
            to={to(`/collections/${col.slug}`)}
            className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-foreground/25 text-small text-foreground transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            עוד מהקולקציה
          </Link>
        </div>
      </Reveal>
    </section>
  );
};

const CollectionsPage = () => {
  const { collections, products, loading } = useCollections();
  const { hash } = useLocation();
  const { to } = useLocalizedPath();
  const text = useSiteText();
  const [scrolledTo, setScrolledTo] = useState<string | null>(null);

  // An incoming #slug (the header's dropdown links here) can only be honoured
  // once the sections exist, which is after the data lands — the browser's own
  // fragment scroll fires too early and hits a skeleton.
  useEffect(() => {
    if (loading || !hash) return;
    const slug = decodeURIComponent(hash.slice(1));
    if (slug === scrolledTo) return;
    const el = document.getElementById(slug);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
    setScrolledTo(slug);
  }, [loading, hash, scrolledTo]);

  const bySlug = useMemo(() => {
    const m = new Map<string, DBProduct[]>();
    for (const c of collections) m.set(c.slug, []);
    for (const p of products) {
      const col = collections.find((c) => c.id === p.collection_id);
      if (col) m.get(col.slug)?.push(p);
    }
    return m;
  }, [collections, products]);

  const collectionSchema = {
"@context": "https://schema.org",
"@type": "CollectionPage",
    name: "קולקציות Aluma",
    description: "סלוני חוץ, פינות אוכל ושולחנות אש בייצור אישי.",
    url: `${SITE}/collections`,
    inLanguage: "he-IL",
    mainEntity: {
"@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
"@type": "ListItem",
        position: i + 1,
        item: {
"@type": "Product",
          name: p.name,
          url: `${SITE}/products/${p.slug}`,
        },
      })),
    },
  };

  return (
    <Layout>
      <SEO
        title="קולקציות | ריהוט חוץ בייצור אישי | Aluma"
        description="הקולקציות של Aluma: סלוני חוץ, פינות אוכל, שולחנות אש ועוד — כל פריט מיוצר בהזמנה אישית, בחומרים שנבנו לחוץ של ישראל."
        path="/collections"
        jsonLd={collectionSchema}
      />

      <PageHero
        title={text("collections.title", "קולקציות")}
        subtitle={text(
          "collections.subtitle",
          "כל פריט מיוצר בהזמנה אישית. בלי מחירון — כי אין אצלנו שני פרויקטים זהים.",
        )}
      />

      {/* The categories, moved here off the home page. A catalogue page is
          where a visitor has already decided to browse, so showing the whole
          range is help rather than noise. */}
      <section className="container-luxury pt-6 pb-16 md:pb-24">
        <CategoryGrid />
      </section>

      <div className="container-luxury pb-10 md:pb-16">
        {loading ? (
          <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-square rounded-sm bg-secondary" />
                <div className="h-5 w-2/3 mx-auto rounded-sm bg-secondary" />
                <div className="h-4 w-full rounded-sm bg-secondary" />
              </div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-body text-muted-foreground mb-6">
              הקולקציות בדרך. בינתיים — נשמח להכיר אתכם.
            </p>
            <Link to={to("/faq") + "#contact"} className="btn-shine inline-flex">
              צרו קשר
            </Link>
          </div>
        ) : (
          collections.map((c, i) => (
            <CollectionSection
              key={c.id}
              collection={c}
              products={bySlug.get(c.slug) ?? []}
              first={i === 0}
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default CollectionsPage;
