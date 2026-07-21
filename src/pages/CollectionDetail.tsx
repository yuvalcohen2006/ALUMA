import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Ruler, Layers } from "lucide-react";
import NotFound from "./NotFound";
import { supabase } from "@/integrations/supabase/client";
import type { DBProduct } from "@/hooks/useCollectionsData";
import FavoriteButton from "@/components/FavoriteButton";
import { trackPixel } from "@/lib/pixel";

const SITE = "https://alumaoutdoor.com";

const CollectionDetailPage = () => {
  const { slug } = useParams();
  const galleryRef = useRef<HTMLDivElement>(null);
  const [item, setItem] = useState<DBProduct | null>(null);
  const [related, setRelated] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setLoadError(false);
    const { data, error } = await supabase
      .from("site_collection_products")
      .select(
        "id, collection_id, slug, name, tag, tagline, description, highlights, materials, dimensions, cover_url, gallery"
      )
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    // A query error is NOT a missing product, don't render a false 404.
    if (error) {
      setLoadError(true);
      setItem(null);
      setLoading(false);
      return;
    }
    if (data) {
      const p: DBProduct = {
        ...(data as any),
        description: Array.isArray((data as any).description) ? (data as any).description : [],
        highlights: Array.isArray((data as any).highlights) ? (data as any).highlights : [],
        materials: Array.isArray((data as any).materials) ? (data as any).materials : [],
        gallery: Array.isArray((data as any).gallery) ? (data as any).gallery : [],
      };
      setItem(p);
      const { data: rel } = await supabase
        .from("site_collection_products")
        .select("id, collection_id, slug, name, tag, tagline, description, highlights, materials, dimensions, cover_url, gallery")
        .eq("collection_id", p.collection_id)
        .eq("published", true)
        .neq("id", p.id)
        .limit(3);
      setRelated(((rel as any[]) || []) as DBProduct[]);
    } else {
      setItem(null);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!item) return;
    trackPixel("ViewContent", {
      content_name: item.name,
      content_category: item.tag ?? "קולקציות",
      content_ids: [item.slug],
      content_type: "product",
    });
  }, [item]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          טוען…
        </div>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
          <p className="text-muted-foreground">אירעה שגיאה בטעינת הפריט. בדקו את החיבור ונסו שוב.</p>
          <Button onClick={load} variant="outline">
            נסו שוב
          </Button>
        </div>
      </Layout>
    );
  }

  if (!item) return <NotFound />;

  const galleryImages = item.gallery && item.gallery.length > 0
    ? item.gallery
    : item.cover_url
      ? [item.cover_url]
      : [];

  const scrollGallery = (dir: 1 | -1) => {
    const el = galleryRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    description: item.tagline ?? "",
    image: item.cover_url ?? undefined,
    brand: { "@type": "Brand", name: "Aluma" },
    category: item.tag ?? undefined,
    material: item.materials.join(", "),
    offers: {
      "@type": "Offer",
      // Made-to-order / quote-based: no fixed price. A fake "0" + InStock is
      // invalid structured data, so we signal pre-order and omit the price.
      availability: "https://schema.org/PreOrder",
      url: `${SITE}/contact`,
      description: "מחיר לפי הצעת מחיר אישית",
    },
  };

  return (
    <Layout>
      <SEO
        title={`${item.name} | קולקציות | Aluma`}
        description={`${item.name}, ${item.tagline ?? ""}. ${item.description[0] ?? ""}`}
        path={`/collections/${item.slug}`}
        jsonLd={productJsonLd}
      />

      {/* BACK LINK */}
      <section className="bg-background pt-24 md:pt-28 pb-6 md:pb-10">
        <div className="container-luxury">
          <Link
            to="/collections"
            className="inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground hover:text-accent transition-smooth"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>חזרה לקולקציות</span>
          </Link>
        </div>
      </section>

      {/* TITLE, centered */}
      <section className="pb-8 md:pb-12 bg-background">
        <div className="container-luxury text-center">
          {item.tag && (
            <div className="inline-block px-3 py-1 mb-4 bg-secondary text-foreground text-[11px] tracking-[0.35em] uppercase rounded-sm">
              {item.tag}
            </div>
          )}
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-primary">
              {item.name}
            </h1>
            <FavoriteButton
              productId={item.id}
              collectionSlug={item.slug}
              size="md"
              variant="inline"
              className="shrink-0 -mt-1"
            />
          </div>
          {item.tagline && (
            <p className="text-base md:text-lg italic font-normal text-muted-foreground max-w-2xl mx-auto">
              {item.tagline}
            </p>
          )}
        </div>
      </section>

      {/* MAIN 2-COLUMN */}
      <section className="pb-16 md:pb-24 bg-background">
        <div className="container-luxury grid md:grid-cols-5 gap-8 md:gap-12 items-stretch">
          {/* RIGHT COLUMN, text */}
          <div className="md:col-span-2 order-2 md:order-1 flex flex-col gap-6 md:gap-8">
            {item.description.length > 0 && (
              <div className="border border-primary/40 rounded-sm p-6 md:p-8">
                <SectionLabel he="על המוצר" en="The Piece" className="text-xs justify-start mb-5" />
                <div className="space-y-5">
                  {item.description.map((p, i) => (
                    <p key={i} className="text-foreground/85 font-normal leading-loose text-[16px]">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {item.highlights.length > 0 && (
              <div className="border border-primary/40 rounded-sm p-6 md:p-8">
                <div className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
                  נקודות עיצוב
                </div>
                <ul className="space-y-3">
                  {item.highlights.map((h) => (
                    <li key={h.title} className="flex gap-3">
                      <Check className="w-4 h-4 text-accent mt-1 shrink-0" />
                      <div className="text-foreground font-normal text-[15px] leading-relaxed">
                        {h.title}{h.desc && <span className="text-muted-foreground">, {h.desc}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(item.materials.length > 0 || item.dimensions) && (
              <div className="border border-primary/40 rounded-sm p-6 md:p-8">
                {item.materials.length > 0 && (
                  <div className="flex items-start gap-3 mb-6">
                    <Layers className="w-4 h-4 text-accent mt-1 shrink-0" />
                    <div>
                      <div className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                        חומרים
                      </div>
                      <div className="text-foreground font-normal text-[15px] leading-relaxed space-y-1">
                        {item.materials.map((m, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-sm bg-accent shrink-0" />
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {item.dimensions && (
                  <div className={`flex items-start gap-3 ${item.materials.length > 0 ? 'pt-6 border-t border-border/60' : ''}`}>
                    <Ruler className="w-4 h-4 text-accent mt-1 shrink-0" />
                    <div>
                      <div className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                        מידות בסיס
                      </div>
                      <div className="text-foreground font-normal text-[15px] leading-relaxed">
                        {item.dimensions}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {item.description.length === 0 && item.highlights.length === 0 && item.materials.length === 0 && !item.dimensions && (
              <div className="border border-primary/40 rounded-sm p-6 md:p-8 min-h-[400px] flex items-center justify-center text-muted-foreground font-light text-sm">
                בקרוב פרטים נוספים
              </div>
            )}
          </div>

          {/* LEFT COLUMN, gallery (main + thumbs) */}
          <div className="md:col-span-3 order-1 md:order-2">
            {/* Mobile: horizontal carousel */}
            <div className="md:hidden flex overflow-x-auto gap-4 snap-x -mx-6 px-6 pb-2">
              {galleryImages.map((img, i) => (
                <div key={i} className="shrink-0 snap-start w-[85%] sm:w-[60%]">
                  <div className="relative overflow-hidden rounded-sm shadow-soft aspect-[4/3]">
                    <img
                      src={img}
                      alt={`${item.name}, תמונה ${i + 1}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: main image + thumbs column to the left */}
            <div className="hidden md:flex gap-4 h-full">
              {/* Main image (appears on the right within left column, RTL) */}
              <div className="flex-1 order-1">
                <div className="relative overflow-hidden rounded-sm shadow-soft h-full min-h-[500px] max-h-[720px] bg-secondary/30">
                  {galleryImages[activeImage] && (
                    <img
                      src={galleryImages[activeImage]}
                      alt={`${item.name}, תמונה ${activeImage + 1}`}
                      loading="eager"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                      key={activeImage}
                    />
                  )}
                </div>
              </div>


              {/* Thumbnails column (appears on the left in RTL) */}
              {galleryImages.length > 1 && (
                <div className="order-2 w-20 lg:w-24 flex flex-col gap-3 overflow-y-auto max-h-full">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`תמונה ${i + 1}`}
                      className={`relative aspect-square shrink-0 overflow-hidden rounded-sm transition-all ${
                        activeImage === i
                          ? "ring-2 ring-accent opacity-100"
                          : "ring-1 ring-border/60 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-20 md:py-24 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="מגשימים חלום" en="Your Space" className="text-xs mb-6" />
          <h2 className="font-display text-3xl md:text-5xl text-foreground font-light mb-5 leading-tight">
            השאירו פרטים
          </h2>
          <p className="text-muted-foreground font-normal max-w-xl mx-auto mb-10 leading-relaxed">
            כל פרויקט מתוכנן ומיוצר בהתאם לאופי המרחב עד לפרטים הקטנים ביותר.
          </p>
          <Button asChild size="lg" className="rounded-sm tracking-wider">
            <Link to="/contact" className="inline-flex items-center gap-2">
              להשארת פרטים
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="py-16 md:py-24 bg-background">
          <div className="container-luxury">
            <div className="text-[11px] tracking-[0.4em] uppercase text-accent mb-8 text-center">
              עוד מהקולקציה
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {related.map((c) => (
                <Link key={c.slug} to={`/collections/${c.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-4 shadow-soft">
                    {c.cover_url && (
                      <img
                        src={c.cover_url}
                        alt={c.name}
                        width={800}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    {c.tag && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-sm text-xs tracking-wider text-foreground font-medium">
                        {c.tag}
                      </div>
                    )}
                  </div>
                  <h3 className="font-display text-xl text-foreground group-hover:text-accent transition-smooth flex items-center gap-2">
                    {c.name}
                    <ArrowLeft className="w-4 h-4" />
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default CollectionDetailPage;
