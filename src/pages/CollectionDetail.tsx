import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Ruler, Layers } from "lucide-react";
import NotFound from "./NotFound";
import { supabase } from "@/integrations/supabase/client";
import { normaliseProduct, type DBProduct } from "@/hooks/useCollectionsData";
import { trackPixel } from "@/lib/pixel";
import { formatPrice } from "@/lib/price";
import Ltr from "@/components/Ltr";
import { useProductGallery, type ProductVariant } from "@/hooks/useProductGallery";
import { useTranslation } from "react-i18next";

const SITE = "https://alumaoutdoor.com";

const CollectionDetailPage = () => {
  const { slug } = useParams();
  const { t } = useTranslation("catalogue");
  const [item, setItem] = useState<DBProduct | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [related, setRelated] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { images: galleryImages, activeImage, setActiveImage, selected, activeVariant, selectVariant } =
    useProductGallery(item, variants);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setLoadError(false);

    const demoAllowed = import.meta.env.VITE_USE_DEMO_DATA !== "0";

    const { data, error } = await supabase
      .from("site_collection_products")
      .select(
"id, collection_id, slug, name, tag, tagline, description, highlights, materials, dimensions, cover_url, gallery, price, price_note"
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
    // Mirrors useCollectionsData: the index falls back to the placeholder
    // catalogue while the database is empty, so detail pages have to resolve
    // from it too — otherwise every placeholder product 404s the moment it is
    // clicked. A real row always wins.
    if (!data && demoAllowed) {
      const { demoProducts } = await import("@/data/demoCollections");
      const found = demoProducts.find((p) => p.slug === slug) ?? null;
      if (found) {
        setItem(found);
        setRelated(
          demoProducts
            .filter((p) => p.collection_id === found.collection_id && p.id !== found.id)
            .slice(0, 3)
        );
        setLoading(false);
        return;
      }
    }

    if (data) {
      const p = normaliseProduct(data);
      setItem(p);
      const { data: rel } = await supabase
        .from("site_collection_products")
        .select("id, collection_id, slug, name, tag, tagline, description, highlights, materials, dimensions, cover_url, gallery, price, price_note")
        .eq("collection_id", p.collection_id)
        .eq("published", true)
        .neq("id", p.id)
        .limit(3);
      setRelated(((rel as any[]) || []).map(normaliseProduct));
    } else {
      setItem(null);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    if (!item?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("product_variants")
          .select("id, name, swatch, image_url")
          .eq("product_id", item.id)
          .order("sort_order", { ascending: true });
        if (!cancelled && data) setVariants(data as ProductVariant[]);
      } catch {
        // No finishes is the normal case for most products.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item?.id]);

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
        <div className="min-h-[60vh] flex items-center justify-center text-body text-muted-foreground">
          {t("loading")}
        </div>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-6">
          <p className="text-body leading-relaxed text-muted-foreground max-w-md">
            {t("loadError")}
          </p>
          <Button onClick={load} variant="outline" className="rounded-sm text-body px-6">
            {t("retry")}
          </Button>
        </div>
      </Layout>
    );
  }

  if (!item) return <NotFound />;

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
      description: t("quoteOnly"),
    },
  };

  return (
    <Layout>
      <SEO
        title={`${item.name} | קולקציות | Aluma`}
        description={`${item.name}, ${item.tagline ?? ""}. ${item.description[0] ?? ""}`}
        path={`/products/${item.slug}`}
        jsonLd={productJsonLd}
      />

      {/* BACK LINK */}
      <section className="bg-background pt-24 md:pt-28 pb-6 md:pb-10">
        <div className="container-luxury">
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 text-body text-muted-foreground hover:text-accent transition-smooth"
          >
            <ArrowRight className="w-4 h-4" />
            <span>חזרה לקולקציות</span>
          </Link>
        </div>
      </section>

      {/* TITLE, centered */}
      <section className="pb-8 md:pb-12 bg-background">
        <div className="container-luxury text-center">
          {item.tag && (
            <div className="inline-block px-4 py-1.5 mb-5 bg-secondary text-foreground text-body rounded-sm">
              {item.tag}
            </div>
          )}
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight text-foreground">
              {item.name}
            </h1>
          </div>
          {item.tagline && (
            <p className="text-body leading-relaxed italic text-foreground-soft max-w-2xl mx-auto">
              {item.tagline}
            </p>
          )}
          {/* Only when there is one. Most pieces are made to order and carry
              no price at all, and an empty price line reads as an error. */}
          {formatPrice(item.price) && (
            <p className="text-body text-foreground">
              {item.price_note && (
                <span className="text-foreground-soft">{item.price_note} </span>
              )}
              <span dir="ltr">{formatPrice(item.price)}</span>
            </p>
          )}
        </div>
      </section>

      {/* MAIN 2-COLUMN */}
      <section className="pb-16 md:pb-24 bg-background">
        <div className="container-luxury grid md:grid-cols-5 gap-8 md:gap-12 items-stretch">
          {/* RIGHT COLUMN, text */}
          <div className="md:col-span-2 order-2 md:order-1 flex flex-col gap-6 md:gap-8">
            {/* Finishes. Each swatch carries its own photograph, so choosing
                one changes the picture rather than just tinting a square.
                Shown only when a product actually has finishes loaded — most
                have none, and an empty picker is worse than no picker. */}
            {variants.length > 0 && (
              <div>
                <p className="text-label text-muted-foreground">
                  {t("product.finish")}{selected ? `: ${selected.name}` : ""}
                </p>
                <ul className="mt-3 flex flex-wrap gap-3">
                  {variants.map((v) => {
                    const isActive = v.id === activeVariant;
                    return (
                      <li key={v.id}>
                        <button
                          type="button"
                          onClick={() => selectVariant(isActive ? null : v.id)}
                          aria-pressed={isActive}
                          // The colour alone must not carry the state: a ring
                          // AND the label above tell you what is selected.
                          title={v.name}
                          className={`h-9 w-9 rounded-full border transition-colors ${
                            isActive
                              ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                              : "border-foreground/20 hover:border-foreground/50"
                          }`}
                          style={v.swatch ? { backgroundColor: v.swatch } : undefined}
                        >
                          <span className="sr-only">{v.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {item.description.length > 0 && (
              <div className="border border-border bg-card rounded-sm  p-6 md:p-8">
                <h2 className="font-display font-medium text-heading leading-snug text-foreground">
                  {t("sections.about")}
                </h2>
                <div className="w-20 h-[2px] bg-foreground/15 mt-5 mb-6" aria-hidden="true" />
                <div className="space-y-5">
                  {item.description.map((p, i) => (
                    <p key={i} className="text-foreground text-body">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {item.highlights.length > 0 && (
              <div className="border border-border bg-card rounded-sm  p-6 md:p-8">
                <h2 className="font-display font-medium text-heading leading-snug text-foreground">
                  {t("sections.highlights")}
                </h2>
                <div className="w-20 h-[2px] bg-foreground/15 mt-5 mb-6" aria-hidden="true" />
                <ul className="space-y-4">
                  {item.highlights.map((h) => (
                    <li key={h.title} className="flex gap-3">
                      <Check className="w-5 h-5 text-accent mt-1 shrink-0" />
                      <div className="text-foreground font-normal text-body leading-relaxed">
                        {h.title}{h.desc && <span className="text-muted-foreground">, {h.desc}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(item.materials.length > 0 || item.dimensions) && (
              <div className="border border-border bg-card rounded-sm  p-6 md:p-8">
                {item.materials.length > 0 && (
                  <div className="flex items-start gap-3 mb-6">
                    <Layers className="w-5 h-5 text-accent mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-display font-normal text-body text-foreground mb-3">
                        {t("sections.materials")}
                      </div>
                      <div className="text-foreground font-normal text-body leading-relaxed space-y-1.5">
                        {item.materials.map((m, i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {item.dimensions && (
                  <div className={`flex items-start gap-3 ${item.materials.length > 0 ? 'pt-6 border-t border-border' : ''}`}>
                    <Ruler className="w-5 h-5 text-accent mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-display font-normal text-body text-foreground mb-3">
                        {t("sections.dimensions")}
                      </div>
                      <div className="text-foreground font-normal text-body leading-relaxed">
                        {/* Isolated: "320 × 260" in a Hebrew line
                            displays as "260 × 320" without it. */}
                        <Ltr>{item.dimensions}</Ltr>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {item.description.length === 0 && item.highlights.length === 0 && item.materials.length === 0 && !item.dimensions && (
              <div className="border border-border bg-card rounded-sm  p-6 md:p-8 min-h-[400px] flex items-center justify-center text-muted-foreground text-body">
                {t("sections.more")}
              </div>
            )}
          </div>

          {/* LEFT COLUMN, gallery (main + thumbs) */}
          <div className="md:col-span-3 order-1 md:order-2">
            {/* Mobile: horizontal carousel */}
            {/* Bleed must match container-luxury's own padding (px-5 → sm:px-6)
                exactly, or the scroller overhangs the viewport at 375px. */}
            <div className="md:hidden flex overflow-x-auto gap-4 snap-x -mx-5 px-5 sm:-mx-6 sm:px-6 pb-2">
              {galleryImages.map((img, i) => (
                <div key={i} className="shrink-0 snap-start w-[85%] sm:w-[60%]">
                  <div className="relative overflow-hidden rounded-sm  aspect-[4/3] bg-secondary">
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
                <div className="relative overflow-hidden rounded-sm  h-full min-h-[500px] max-h-[720px] bg-secondary/30">
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
                      className={`relative aspect-square shrink-0 overflow-hidden rounded-sm transition-smooth ${
                        activeImage === i
                          ? "ring-2 ring-accent opacity-100"
                          : "ring-1 ring-border opacity-70 hover:opacity-100 hover:ring-primary/60"
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
        <div className="container-luxury flex flex-col items-center text-center">
          {/* Charcoal, not terracotta: this block sits on sand beige. */}
          <p className="text-body text-foreground-soft mb-4">מגשימים חלום</p>
          <h2 className="font-display font-normal text-3xl md:text-5xl text-foreground leading-tight">
            {t("leaveDetails")}
          </h2>
          <div className="w-20 h-[2px] bg-foreground/15 my-5" aria-hidden="true" />
          <p className="text-body font-normal leading-relaxed text-foreground max-w-xl mx-auto mb-10">
            {t("bespokeNote")}
          </p>
          <Button asChild size="lg" className="rounded-sm text-body px-8">
            <Link to="/faq#contact" className="inline-flex items-center gap-2">
              {t("leaveDetailsCta")}
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="py-16 md:py-24 bg-background">
          <div className="container-luxury">
            <div className="flex flex-col items-center text-center mb-10 md:mb-12">
              <h2 className="font-display font-medium text-heading leading-snug text-foreground">
                {t("product.related")}
              </h2>
              <div className="w-20 h-[2px] bg-foreground/15 mt-5" aria-hidden="true" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {related.map((c) => (
                <Link
                  key={c.slug}
                  to={`/products/${c.slug}`}
                  className="group block bg-card rounded-sm overflow-hidden border border-border  hover:border-foreground/15  transition-smooth"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {c.cover_url && (
                      <img
                        src={c.cover_url}
                        alt={c.name}
                        width={800}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.06]"
                      />
                    )}
                    {c.tag && (
                      <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-background/90 backdrop-blur-sm rounded-sm text-body text-foreground">
                        {c.tag}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-normal text-body text-foreground group-hover:text-accent transition-smooth flex items-center gap-2">
                      {c.name}
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                    </h3>
                  </div>
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
