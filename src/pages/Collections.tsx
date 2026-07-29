import { Fragment, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import FilterSidebar, { type FilterGroup } from "@/components/FilterSidebar";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useCollections, type DBCollection, type DBProduct } from "@/hooks/useCollectionsData";
import FavoriteButton from "@/components/FavoriteButton";

const SITE = "https://alumaoutdoor.com";

/**
 * The whole grouping device, and the only thing left of what used to be a
 * per-collection <section>: the client's heading, a count, a hairline and the
 * intro — one full-width row inside the single catalogue grid.
 *
 * RTL: the <h2> is the first flex child, so it sits against the RIGHT container
 * edge, the count follows it inward and the rule runs out to the far LEFT.
 *
 * `items-baseline` needs no help from the rule: an empty flex item synthesises
 * its baseline from its own bottom edge, which lands it exactly on the type
 * baseline.
 *
 * The count is `hidden sm:inline` so a long CMS name at 375px can never squeeze
 * the rule to nothing; `flex-wrap` + `min-w-0` on the h2 + `min-w-[48px]` on the
 * rule mean a name too long to share the line wraps and drops the rule to its
 * own line instead of overflowing the page.
 */
const CollectionLabel = ({
  col,
  count,
  first,
}: {
  col: DBCollection;
  count: number;
  first: boolean;
}) => (
  <Reveal className={`col-span-full ${first ? "pt-0" : "pt-10 md:pt-14"}`}>
    <div className="flex flex-wrap items-baseline gap-x-4 md:gap-x-5 gap-y-2">
      {/* Heading classes copied verbatim from the old CategoryRow — the brief
          was "keep only the titles the same", so only its POSITION changes:
          centred column → right-anchored line. Terracotta on warm white
          measures 3.08:1, which is AA for large text. Do not "fix" it. */}
      <h2
        id={col.slug}
        className="scroll-mt-32 min-w-0 font-display text-3xl md:text-4xl text-primary font-normal leading-tight"
      >
        {col.name_he}
      </h2>
      {/* Hebrew has a real singular: "1 פריטים" is wrong, and a type filter can
          easily leave a collection with exactly one match. Zero is left unsaid —
          the "בקרוב" line below already says it, better. */}
      {count > 0 && (
        <span className="hidden sm:inline shrink-0 text-[18px] text-muted-foreground tabular-nums">
          {count === 1 ? "פריט אחד" : `${count} פריטים`}
        </span>
      )}
      <span aria-hidden="true" className="h-px flex-1 min-w-[48px] bg-primary/25" />
    </div>

    {col.intro && (
      <p className="mt-3 max-w-[62ch] text-[20px] leading-relaxed text-foreground-soft text-pretty">
        {col.intro}
      </p>
    )}
  </Reveal>
);

/**
 * One product. No card panel — a framed photograph sitting on the page
 * background, with the caption aligned to the photo's right edge.
 *
 * `lead` gives the first product of a collection `col-span-2` below sm, so on a
 * 375px phone every collection opens on a real 335×251 photograph and the rest
 * scan 2-up. At sm and above every cell is already ≥284px, so the span is
 * released.
 */
const ProductCell = ({
  product: p,
  index,
  lead,
  eager,
}: {
  product: DBProduct;
  index: number;
  lead: boolean;
  eager: boolean;
}) => {
  const meta = [p.tag, p.dimensions].filter(Boolean) as string[];

  return (
    // Delay cascades from the right — index 0 is the rightmost child in RTL —
    // so the reveal runs in reading order.
    <Reveal
      delay={(index % 3) * 80}
      className={`min-w-0 ${lead ? "col-span-2 sm:col-span-1" : ""}`}
    >
      {/* `group` on the wrapper, not the Link, so the FavoriteButton is a
          sibling of the anchor and hovering the caption still lifts the photo. */}
      <div className="group relative">
        <Link to={`/collections/${p.slug}`} className="block text-right">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-secondary border border-border transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-luxury group-hover:border-primary/60">
            {/* Zoom on the wrapper, never the <img> — scaling the image drags
                the border and the radius with it in some engines. Same
                construction as the approved Projects entry. */}
            <div className="absolute inset-0 transition-transform duration-600 ease-out group-hover:scale-[1.06]">
              {p.cover_url && (
                <img
                  src={p.cover_url}
                  alt={[p.name, p.tag].filter(Boolean).join(", ") + " | Aluma"}
                  width={1024}
                  height={768}
                  loading={eager ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <h3 className="mt-4 font-display font-normal text-[22px] leading-snug text-foreground transition-colors duration-300 group-hover:text-accent">
            {p.name}
          </h3>

          {p.tagline && (
            <p className="mt-1.5 text-[18px] leading-relaxed text-muted-foreground text-pretty">
              {p.tagline}
            </p>
          )}

          {/* The tag used to be an opaque chip floating on the photograph, 20×
              per page. It is ink on the page now, next to the dimensions.
              `hidden sm:flex`: at 159px the tag + dimensions + rule wrap to two
              18px lines under a 120px photo — caption taller than the plate —
              and the 18px floor forbids shrinking them. Each rule travels
              INSIDE the item it follows, so a wrap can only ever leave a rule
              at the left margin. */}
          {meta.length > 0 && (
            <div className="mt-2 hidden sm:flex flex-wrap items-center gap-y-1 text-[18px] text-muted-foreground">
              {meta.map((m, j) => (
                <span key={`${j}-${m}`} className="inline-flex items-center whitespace-nowrap">
                  {m}
                  {j < meta.length - 1 && (
                    <span aria-hidden="true" className="w-px h-4 bg-primary/45 shrink-0 mx-3" />
                  )}
                </span>
              ))}
            </div>
          )}
        </Link>

        {/* `size="sm"` (32px): the default 40px is 34% of a 119px mobile photo.
            `left-3` is physical on purpose — this is a positioned overlay, not
            flow content, so it must not become a logical property. */}
        <FavoriteButton
          productId={p.id}
          collectionSlug={p.slug}
          size="sm"
          className="absolute top-3 left-3 z-10"
        />
      </div>
    </Reveal>
  );
};

const CollectionsPage = () => {
  const { collections, products, loading } = useCollections();
  const { hash, pathname, search } = useLocation();
  const navigate = useNavigate();
  const { value, setValue, activeCount } = useFilterParams(["cat", "type"]);

  // Back-compat: the header's קולקציות dropdown still links to /collections#slug.
  // Fold an incoming hash into the filter state and drop it from the URL.
  useEffect(() => {
    if (!hash) return;
    const slug = decodeURIComponent(hash.replace("#", ""));
    const params = new URLSearchParams(search);
    params.set("cat", slug);
    navigate({ pathname, search: params.toString() }, { replace: true });
  }, [hash, pathname, search, navigate]);

  const selectedCats = value.cat;
  const selectedTypes = value.type;

  const visible = useMemo(() => {
    const byCat = selectedCats.length
      ? collections.filter((c) => selectedCats.includes(c.slug))
      : collections;
    if (!selectedTypes.length) return byCat;
    // A collection stays on the page only while it still has a product of a
    // selected type — a label over nothing is worse than a hidden group.
    return byCat.filter((c) =>
      products.some(
        (p) => p.collection_id === c.id && p.tag && selectedTypes.includes(p.tag)
      )
    );
  }, [collections, products, selectedCats, selectedTypes]);

  const productsFor = (collectionId: string) =>
    products.filter(
      (p) =>
        p.collection_id === collectionId &&
        (!selectedTypes.length || (p.tag && selectedTypes.includes(p.tag)))
    );

  const filterGroups: FilterGroup[] = useMemo(() => {
    const tags = Array.from(
      new Set(products.map((p) => p.tag).filter((t): t is string => !!t))
    ).sort((a, b) => a.localeCompare(b, "he"));
    return [
      {
        key: "cat",
        label: "קטגוריה",
        options: collections.map((c) => ({
          value: c.slug,
          label: c.name_he,
          count: products.filter((p) => p.collection_id === c.id).length,
        })),
      },
      {
        key: "type",
        label: "סוג מוצר",
        options: tags.map((tag) => ({
          value: tag,
          label: tag,
          count: products.filter((p) => p.tag === tag).length,
        })),
      },
    ];
  }, [collections, products]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "קולקציות Aluma",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        category: p.tag,
        brand: { "@type": "Brand", name: "Aluma" },
        image: p.cover_url ?? undefined,
        url: `${SITE}/collections/${p.slug}`,
      },
    })),
  };

  return (
    <Layout>
      <SEO
        title="קולקציות | Aluma"
        description="גלו את הקולקציות של Aluma, סלוני חוץ, שולחנות חוץ ועוד. עיצוב אישי לכל מרחב חוץ."
        path="/collections"
        jsonLd={itemList}
      />
      <PageHero
        title={
          // One collection names itself. A subset states how many, and hovering
          // the count lists exactly which — the names would be too long to sit
          // in the title, but "3 collections" alone is not answerable.
          visible.length === 1 ? (
            `קולקציית ${visible[0].name_he}`
          ) : visible.length < collections.length ? (
            <span
              className="cursor-default border-b border-dashed border-primary/40"
              title={visible.map((c) => c.name_he).join(" · ")}
            >
              נבחרו {visible.length} קולקציות להצגה
            </span>
          ) : (
            "כל הקולקציות שלנו"
          )
        }
        // With one collection on screen its intro belongs to the page, not to a
        // label row that would only repeat the title above it.
        subtitle={visible.length === 1 ? (visible[0].intro ?? undefined) : undefined}
        filterSlot={
          <FilterSidebar
            groups={filterGroups}
            value={value}
            onChange={setValue}
            activeCount={activeCount}
            resultCount={visible.length}
          />
        }
      />

      <section className="bg-background pt-6 md:pt-10 pb-24 md:pb-32">
        <div className="container-luxury">
          {loading ? (
            <p className="py-24 text-center text-[20px] leading-relaxed text-foreground-soft">
              טוען…
            </p>
          ) : collections.length === 0 ? (
            <p className="py-24 text-center text-[20px] leading-relaxed text-foreground-soft">
              עדיין לא הועלו קולקציות. חזרו בקרוב.
            </p>
          ) : visible.length === 0 ? (
            <Reveal className="max-w-xl mx-auto text-center py-24 md:py-32">
              <p className="text-[20px] leading-relaxed text-foreground-soft">
                אין קולקציות שמתאימות לסינון שבחרתם.
              </p>
              <button
                type="button"
                onClick={() => setValue({ cat: [], type: [] })}
                className="mt-6 text-[18px] text-accent link-underline transition-smooth"
              >
                נקה את הסינון
              </button>
            </Reveal>
          ) : (
            /* ONE grid for the whole catalogue. Column tracks and gutters never
               change from the first product to the last; a collection is a
               label inside it, not a section around it.

               Never add `grid-flow-dense` — default sparse flow is what
               guarantees a col-span-full label always starts a fresh row after
               a ragged one. The ragged last row is correct: in RTL the gap
               falls on the LEFT, the same side as a ragged text edge in Hebrew.

               gap-y > gap-x at every breakpoint: cells in a row belong
               together, rows do not. */
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 lg:gap-x-7 gap-y-10 md:gap-y-12 lg:gap-y-16">
              {visible.map((c, ci) => {
                const items = productsFor(c.id);
                return (
                  <Fragment key={c.id}>
                    {/* The old showHeading gate, moved up one level: with a
                        single collection on screen nothing repeats its name,
                        because the page title already says it. */}
                    {visible.length > 1 && (
                      <CollectionLabel col={c} count={items.length} first={ci === 0} />
                    )}
                    {items.length === 0 ? (
                      <p className="col-span-full py-4 text-[20px] leading-relaxed text-muted-foreground">
                        בקרוב, מוצרים חדשים בקולקציה זו.
                      </p>
                    ) : (
                      items.map((p, i) => (
                        <ProductCell
                          key={p.slug}
                          product={p}
                          index={i}
                          lead={i === 0}
                          eager={ci === 0 && i < 2}
                        />
                      ))
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CollectionsPage;
