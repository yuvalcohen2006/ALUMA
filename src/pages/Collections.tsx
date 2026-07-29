import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import FilterSidebar, { type FilterGroup } from "@/components/FilterSidebar";
import { useFilterParams } from "@/hooks/useFilterParams";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCollections, type DBCollection, type DBProduct } from "@/hooks/useCollectionsData";
import FavoriteButton from "@/components/FavoriteButton";

const SITE = "https://alumaoutdoor.com";

const CategoryRow = ({
  col,
  products,
  showHeading = true,
}: {
  col: DBCollection;
  products: DBProduct[];
  /** Hidden when this is the only collection on screen — the page title
   *  already names it, and repeating it twice reads as a mistake. */
  showHeading?: boolean;
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section
      id={col.slug}
      className="py-16 md:py-24 first:pt-8 scroll-mt-28 border-t border-border/60 first:border-t-0"
    >
      <div className="container-luxury">
<div className="text-center mb-10 max-w-2xl mx-auto">
          {showHeading && (
            <h2 className="font-display text-3xl md:text-4xl text-primary font-normal leading-tight">
              {col.name_he}
            </h2>
          )}
          {col.intro && (
            <p className={`text-body text-foreground-soft ${showHeading ? "mt-4" : ""}`}>
              {col.intro}
            </p>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">בקרוב, מוצרים חדשים בקולקציה זו.</p>
        ) : (
          <>
            <div
              ref={scrollerRef}
              dir="rtl"
              className="flex gap-5 lg:gap-7 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6"
              style={{ scrollbarWidth: "none" }}
            >
              {products.map((p, i) => (
                <div key={p.slug} className="relative shrink-0 snap-start w-[85%] sm:w-[48%] lg:w-[32%]">
                  <Link
                    to={`/collections/${p.slug}`}
                    className="group block bg-card rounded-sm overflow-hidden shadow-soft hover:shadow-luxury hover:-translate-y-1 transition-smooth"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-secondary">
                      {p.cover_url && (
                        <img
                          src={p.cover_url}
                          alt={`${p.name}, ${p.tag ?? ""} | Aluma`}
                          loading={i < 2 ? "eager" : "lazy"}
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {p.tag && (
                        <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-background/90 backdrop-blur-sm rounded-[10px] text-[18px] text-foreground">
                          {p.tag}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-2xl text-primary group-hover:text-accent transition-smooth">
                        {p.name}
                      </h3>
                      {p.tagline && (
                        <p className="text-muted-foreground text-[18px] font-normal mt-2 leading-relaxed">
                          {p.tagline}
                        </p>
                      )}
                    </div>
                  </Link>
                  <FavoriteButton
                    productId={p.id}
                    collectionSlug={p.slug}
                    className="absolute top-4 left-4 z-10"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => scrollBy(1)}
                aria-label="הקודם"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-sm border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth text-[18px]"
              >
                <ArrowRight className="w-4 h-4" />
                <span>הקודם</span>
              </button>
              <button
                onClick={() => scrollBy(-1)}
                aria-label="הבא"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-sm border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth text-[18px]"
              >
                <span>הבא</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
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
    // selected type — an empty carousel is worse than a hidden row.
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
          // One collection in view (picked from the nav or the filter) names
          // itself; otherwise this is the whole catalogue.
          visible.length === 1
            ? `קולקציית ${visible[0].name_he}`
            : "כל הקולקציות שלנו"
        }
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

      <div className="bg-background">
        {loading ? (
          <p className="text-center text-muted-foreground py-24">טוען…</p>
        ) : collections.length === 0 ? (
          <p className="text-center text-muted-foreground py-24">
            עדיין לא הועלו קולקציות. חזרו בקרוב.
          </p>
        ) : visible.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-body text-foreground-soft">
              אין קולקציות שמתאימות לסינון שבחרתם.
            </p>
            <button
              type="button"
              onClick={() => setValue({ cat: [], type: [] })}
              className="mt-4 text-primary hover:opacity-80 transition-smooth"
            >
              נקה את הסינון
            </button>
          </div>
        ) : (
          visible.map((c) => (
            <CategoryRow
              key={c.id}
              col={c}
              products={productsFor(c.id)}
              showHeading={visible.length > 1}
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default CollectionsPage;
