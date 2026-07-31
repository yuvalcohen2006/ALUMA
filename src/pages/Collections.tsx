import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { useCollections, type DBCollection, type DBProduct } from "@/hooks/useCollectionsData";
import { useLocalizedPath } from "@/lib/useLocalizedPath";

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
 * So: an editorial band opens each collection, a row of uniform product tiles
 * follows it, and the only navigation is a row of chips that scroll. Grouping
 * is carried by unequal vertical rhythm — far more space between collections
 * than between rows — rather than by rules or boxes.
 */

/** Sticky chip rail. Anchor-scroll, not filtering — nothing here hides. */
const ChipNav = ({ collections }: { collections: DBCollection[] }) => (
  <nav
    aria-label="קולקציות"
    // Below the fixed h-24 header. Translucent over the content it passes.
    className="sticky top-24 z-30 bg-background/85 backdrop-blur-md border-b border-border/60"
  >
    <div className="container-luxury">
      <ul className="flex gap-2 overflow-x-auto py-3 rail-scroll">
        {collections.map((c) => (
          <li key={c.slug} className="shrink-0">
            <a
              href={`#${c.slug}`}
              className="inline-flex items-center h-9 px-4 rounded-full border border-foreground/15 text-[15px] text-foreground/75 hover:border-foreground/40 hover:text-foreground transition-colors"
            >
              {c.name_he}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </nav>
);

const ProductCard = ({ product: p, eager }: { product: DBProduct; eager: boolean }) => (
  <Link to={`/collections/${p.slug}`} className="group block text-center">
    {/* The tinted panel carries the radius — the card itself has no chrome.
        A border or a hover shadow here is the single clearest cheap tell. */}
    <div className="relative aspect-square overflow-hidden rounded-[14px] bg-secondary/50">
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

    <h3 className="mt-5 font-display font-medium text-[21px] leading-snug text-foreground transition-colors duration-300 group-hover:text-accent">
      {p.name}
    </h3>
    {p.tagline && (
      <p className="mt-1 text-[16px] leading-relaxed text-muted-foreground text-pretty">
        {p.tagline}
      </p>
    )}
    {/* Dimensions stay LTR inside the RTL line, or the × and units flip. */}
    {p.dimensions && (
      <p className="mt-1.5 text-[14px] text-foreground/45">
        <span dir="ltr">{p.dimensions}</span>
      </p>
    )}
  </Link>
);

const CollectionSection = ({
  collection: col,
  products,
  first,
}: {
  collection: DBCollection;
  products: DBProduct[];
  first: boolean;
}) => {
  const band = col.image_url || products[0]?.cover_url || null;

  return (
    // scroll-mt clears the fixed header plus the sticky chips.
    <section id={col.slug} className="scroll-mt-40 py-14 md:py-24">
      {/* The editorial moment — one wide photograph per collection. Size
          contrast lives HERE, not inside the product row: every house the
          research checked keeps product tiles uniform. */}
      {band && (
        <Reveal>
          <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden rounded-[14px] bg-secondary/50">
            <img
              src={band}
              alt=""
              aria-hidden="true"
              loading={first ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="mt-7 md:mt-9 mb-9 md:mb-12 text-right">
          <h2 className="font-display font-bold text-[30px] md:text-[38px] leading-tight text-foreground">
            {col.name_he}
          </h2>
          {col.intro && (
            <p className="mt-3 max-w-[62ch] text-[18px] md:text-[19px] leading-relaxed text-foreground-soft text-pretty">
              {col.intro}
            </p>
          )}
        </div>
      </Reveal>

      {products.length === 0 ? (
        <p className="text-[18px] text-muted-foreground">בקרוב.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-14">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <li>
                <ProductCard product={p} eager={first && i < 4} />
              </li>
            </Reveal>
          ))}
        </ul>
      )}
    </section>
  );
};

const CollectionsPage = () => {
  const { collections, products, loading } = useCollections();
  const { hash } = useLocation();
  const { to } = useLocalizedPath();
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
          url: `${SITE}/collections/${p.slug}`,
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
        title="קולקציות"
        subtitle="כל פריט מיוצר בהזמנה אישית. בלי מחירון — כי אין אצלנו שני פרויקטים זהים."
      />

      {!loading && collections.length > 1 && <ChipNav collections={collections} />}

      <div className="container-luxury pb-10 md:pb-16">
        {loading ? (
          <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-square rounded-[14px] bg-secondary" />
                <div className="h-5 w-2/3 mx-auto rounded-[10px] bg-secondary" />
                <div className="h-4 w-full rounded-[10px] bg-secondary" />
              </div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[20px] text-muted-foreground mb-6">
              הקולקציות בדרך. בינתיים — נשמח להכיר אתכם.
            </p>
            <Link to={to("/contact")} className="btn-shine inline-flex">
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
