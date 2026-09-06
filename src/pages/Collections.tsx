import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { useCollections, type DBCollection, type DBProduct } from "@/hooks/useCollectionsData";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteText } from "@/hooks/useSiteText";
import { useTranslation } from "react-i18next";

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

/**
 * One collection, as a card: its own photograph, its name, how many pieces
 * are in it.
 *
 * This replaces two things that were both wrong. A hand-written grid of eight
 * "category" tiles sat above the page with stock photographs and invented
 * slugs — every one of them a 404 or a link back to this page. Below it, each
 * collection re-listed four of its own products, so the index repeated most
 * of the catalogue before you had chosen anything.
 *
 * A collection is a choice, not a shelf. The card shows what it looks like and
 * how big it is, and the collection's own page has the pieces.
 */
const CollectionCard = ({
  collection: col,
  count,
  eager,
}: {
  collection: DBCollection;
  count: number;
  eager: boolean;
}) => {
  const { to } = useLocalizedPath();
  const { t } = useTranslation("catalogue");
  const cover = col.image_url;

  return (
    <li>
      <Link
        to={to(`/collections/${col.slug}`)}
        className="group block text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <div className="aspect-[4/5] overflow-hidden bg-secondary">
          {cover ? (
            <img
              src={cover}
              alt=""
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            // A collection with no photograph yet still gets a tile of the
            // right shape, so the grid never collapses into a ragged row.
            <div className="grid h-full w-full place-items-center">
              <span className="font-display text-heading text-foreground/20">
                {col.name_he.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <h2 className="mt-4 text-body text-foreground transition-colors group-hover:text-accent">
          {col.name_he}
        </h2>
        <p className="mt-1 text-small text-muted-foreground">
          {t("itemCount", { count })}
        </p>
      </Link>
    </li>
  );
};

const CollectionsPage = () => {
  const { t } = useTranslation("catalogue");
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
        title={t("seo.collectionsTitle")}
        description={t("seo.collectionsDescription")}
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

      <div className="container-luxury pb-24 md:pb-32">
        {loading ? (
          <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="animate-pulse space-y-4">
                <div className="aspect-[4/5] bg-secondary" />
                <div className="h-5 w-2/3 rounded-sm bg-secondary" />
              </li>
            ))}
          </ul>
        ) : collections.length === 0 ? (
          <div className="py-24 text-start">
            <p className="max-w-[46ch] text-body text-muted-foreground">
              {t("empty.title")}
            </p>
            <Link
              to={to("/faq") + "#contact"}
              className="mt-6 inline-block text-small text-foreground underline underline-offset-[6px] decoration-1 transition-colors hover:text-accent"
            >
              {t("empty.cta")}
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {collections.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 70}>
                <CollectionCard
                  collection={c}
                  count={products.filter((p) => p.collection_id === c.id).length}
                  eager={i < 3}
                />
              </Reveal>
            ))}
          </ul>
        )}
      </div>

    </Layout>
  );
};

export default CollectionsPage;
