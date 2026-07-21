import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCollections, type DBCollection, type DBProduct } from "@/hooks/useCollectionsData";
import FavoriteButton from "@/components/FavoriteButton";

const SITE = "https://alumaoutdoor.com";

const CategoryRow = ({
  col,
  products,
}: {
  col: DBCollection;
  products: DBProduct[];
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
          <h2 className="font-display text-3xl md:text-5xl text-primary font-light leading-tight">
            {col.name_he}
          </h2>
          {col.intro && (
            <p className="text-muted-foreground font-light leading-relaxed mt-4">{col.intro}</p>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">בקרוב — מוצרים חדשים בקולקציה זו.</p>
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
                          alt={`${p.name} — ${p.tag ?? ""} | Aluma`}
                          loading={i < 2 ? "eager" : "lazy"}
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {p.tag && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs tracking-wider text-primary font-medium">
                          {p.tag}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-2xl text-primary group-hover:text-accent transition-smooth">
                        {p.name}
                      </h3>
                      {p.tagline && (
                        <p className="text-muted-foreground text-sm font-light mt-2 leading-relaxed">
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
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth text-sm tracking-wider"
              >
                <ArrowRight className="w-4 h-4" />
                <span>הקודם</span>
              </button>
              <button
                onClick={() => scrollBy(-1)}
                aria-label="הבא"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth text-sm tracking-wider"
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
  const { hash } = useLocation();
  const activeHash = decodeURIComponent(hash.replace("#", ""));
  const visible = activeHash
    ? collections.filter((c) => c.slug === activeHash)
    : collections;

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.replace("#", "")));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, [hash]);

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
        description="גלו את הקולקציות של Aluma — סלוני חוץ, שולחנות חוץ ועוד. עיצוב אישי לכל מרחב חוץ."
        path="/collections"
        jsonLd={itemList}
      />
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="קולקציות" en="Collections" className="text-xs mb-5" />
          <h1 className="font-display text-3xl md:text-5xl text-primary font-light tracking-wide mb-6">
            {visible.length === 1 ? visible[0].name_he : "כל הקולקציות במקום אחד"}
          </h1>
          <div className="w-16 h-px bg-primary/30 mx-auto mb-6" />
          {collections.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-8">
              {collections.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.slug}`}
                  className={`font-display text-lg md:text-xl transition-smooth border-b pb-1 ${
                    activeHash === c.slug
                      ? "text-accent border-accent"
                      : "text-primary hover:text-accent border-primary/30 hover:border-accent"
                  }`}
                >
                  {c.name_he}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="bg-background">
        {loading ? (
          <p className="text-center text-muted-foreground py-24">טוען…</p>
        ) : collections.length === 0 ? (
          <p className="text-center text-muted-foreground py-24">
            עדיין לא הועלו קולקציות. חזרו בקרוב.
          </p>
        ) : (
          visible.map((c) => (
            <CategoryRow
              key={c.id}
              col={c}
              products={products.filter((p) => p.collection_id === c.id)}
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default CollectionsPage;
