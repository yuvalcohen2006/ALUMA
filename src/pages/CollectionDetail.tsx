import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import NotFound from "./NotFound";
import { supabase } from "@/integrations/supabase/client";
import { normaliseProduct, type DBProduct } from "@/hooks/useCollectionsData";
import { trackPixel } from "@/lib/pixel";
import { formatPrice } from "@/lib/price";
import Ltr from "@/components/Ltr";
import { useProductGallery, type ProductVariant } from "@/hooks/useProductGallery";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import DirectionalArrow from "@/components/DirectionalArrow";
import TileFallback from "@/components/TileFallback";
import TileCard from "@/components/TileCard";
import { productName } from "@/lib/localized-name";
import { useMaterials, materialName, materialTagline } from "@/hooks/useMaterials";

const SITE = "https://alumaoutdoor.com";

/**
 * One card, used by every block of writing on this page.
 *
 * "על המוצר" was written out in full four times, and the sizes and materials
 * blocks had drifted into a different thing entirely — an icon, a smaller
 * heading, no rule. The client asked for all three to match, which is easier
 * to guarantee with one component than with three copies that have to be kept
 * in step by hand.
 */
const InfoCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="rounded-sm border border-border bg-card p-6 md:p-8">
    <h2 className="font-display font-medium text-heading leading-snug text-foreground">{title}</h2>
    <div className="mb-6 mt-5 h-[2px] w-20 bg-foreground/15" aria-hidden="true" />
    {children}
  </div>
);

const CollectionDetailPage = () => {
  const { slug } = useParams();
  const { t } = useTranslation("catalogue");
  const { to, lang } = useLocalizedPath();
  const [item, setItem] = useState<DBProduct | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [related, setRelated] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { images: galleryImages, activeImage, setActiveImage, selected, activeVariant, selectVariant } =
    useProductGallery(item, variants);
  const { materials: allMaterials } = useMaterials();

  // The materials this piece is ticked for, in the order they were ticked.
  // An id with no material behind it — one deleted since — is dropped rather
  // than rendered as a gap.
  const productMaterials = useMemo(
    () =>
      (item?.material_ids ?? [])
        .map((id) => allMaterials.find((m) => m.id === id))
        .filter((m): m is (typeof allMaterials)[number] => Boolean(m)),
    [item?.material_ids, allMaterials],
  );

  // Three numbers in centimetres, and only the ones filled in. The old
  // single `dimensions` line still shows, as one unlabelled row, for any
  // product that has one and no numbers — nothing typed is thrown away.
  const sizeRows = useMemo(() => {
    const cm = (n: number) => `${n} ${t("sizes.cm")}`;
    const rows = [
      item?.length_cm ? { label: t("sizes.length"), value: cm(item.length_cm) } : null,
      item?.width_cm ? { label: t("sizes.width"), value: cm(item.width_cm) } : null,
      item?.height_cm ? { label: t("sizes.height"), value: cm(item.height_cm) } : null,
    ].filter((row): row is { label: string; value: string } => row !== null);
    if (rows.length) return rows;
    return item?.dimensions ? [{ label: "", value: item.dimensions }] : [];
  }, [item?.length_cm, item?.width_cm, item?.height_cm, item?.dimensions, t]);

  /* Bumped on every load, so a stale response knows it is stale. Without it,
     clicking a related piece and going straight back left whichever request
     happened to finish LAST on screen — the visitor reads and shares the wrong
     product under the right URL, and nothing looks broken. The variants effect
     immediately below already guarded itself this way. */
  const request = useRef(0);

  const load = useCallback(async () => {
    if (!slug) return;
    const ticket = ++request.current;
    const stale = () => ticket !== request.current;
    setLoading(true);
    setLoadError(false);

    const { data, error } = await supabase
      .from("site_collection_products")
      // `*`, for the same reason useCollectionsData gives at length: a column
      // list is a hard dependency on a migration already being applied, and
      // PostgREST rejects the WHOLE query with a 400 for one unknown name. It
      // also meant name_en was never fetched, so the English name the admin
      // has been collecting could never appear on the page that shows it.
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    // A query error is NOT a missing product, don't render a false 404.
    if (stale()) return;
    if (error) {
      setLoadError(true);
      setItem(null);
      setLoading(false);
      return;
    }
    if (data) {
      const p = normaliseProduct(data);

      // The piece is only public if its range is. `published` on the product
      // row says nothing about the collection above it, so turning a range off
      // in the admin hid it from /collections and from the home page and left
      // every /products/:slug inside it fully live — name, photographs, price,
      // CTA — for anyone with a bookmark or a Google result. Its own "more
      // from this collection" strip then linked the hidden siblings, so the
      // whole range stayed browsable while the owner believed it was gone.
      // useCollectionsData already applies this rule to every other surface.
      const { data: parent, error: parentError } = await supabase
        .from("site_collections")
        .select("id")
        .eq("id", p.collection_id)
        .eq("published", true)
        .maybeSingle();
      if (stale()) return;
      if (parentError) {
        setLoadError(true);
        setItem(null);
        setLoading(false);
        return;
      }
      if (!parent) {
        setItem(null);
        setLoading(false);
        return;
      }

      setItem(p);
      const { data: rel } = await supabase
        .from("site_collection_products")
        .select("*")
        .eq("collection_id", p.collection_id)
        .eq("published", true)
        .neq("id", p.id)
        .order("sort_order")
        .limit(3);
      if (stale()) return;
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
      content_category: item.tag ?? "collections",
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
          <Button onClick={load} variant="outline">
            {t("retry")}
          </Button>
        </div>
      </Layout>
    );
  }

  if (!item) return <NotFound />;

  const displayName = productName(lang, item.name, item.name_en);

  const productJsonLd = {
"@context": "https://schema.org",
"@type": "Product",
    name: displayName,
    description: item.tagline ?? "",
    // Absolute: a framed photo is served from this site, as a relative path.
    image: item.cover_url ? new URL(item.cover_url, SITE).href : undefined,
    brand: { "@type": "Brand", name: "Aluma" },
    category: item.tag ?? undefined,
    // The materials it is ticked for, named. Google reads this; the old
    // free-text column it used to read is empty on every row.
    material: productMaterials.map((m) => materialName(m, lang)).join(", "),
    offers: {
"@type": "Offer",
      // Made to order, so pre-order rather than in stock. The price is stated
      // when there is one: the page shows it, and telling Google there is no
      // price while showing one is a mismatch Search Console flags — and it
      // loses the piece its price in the result. /faq#contact, not /contact,
      // which is not a page.
      availability: "https://schema.org/PreOrder",
      url: `${SITE}/faq#contact`,
      ...(item.price
        ? { price: item.price, priceCurrency: "ILS" }
        : { description: t("quoteOnly") }),
    },
  };

  return (
    <Layout>
      <SEO
        title={`${displayName} | ${t("collectionsWord")} | Aluma`}
        /* Assembled from the parts that exist. Written as a template with the
           comma and full stop as literals, a product with no tagline and no
           description — which is every product on the site today — produced
           the meta description "aero, . " for Google to show. */
        description={[displayName, item.tagline, item.description[0]].filter(Boolean).join(". ")}
        path={`/products/${item.slug}`}
        jsonLd={productJsonLd}
      />

      {/* BACK LINK */}
      <section className="bg-background pt-24 md:pt-28 pb-6 md:pb-10">
        <div className="container-luxury">
          <Link
            to={to("/collections")}
            className="group inline-flex items-center gap-2 text-body text-muted-foreground transition-smooth hover:text-foreground"
          >
            <DirectionalArrow direction="back" className="w-4 h-4" />
            <span>{t("backToCollections")}</span>
          </Link>
        </div>
      </section>

      {/* MAIN 2-COLUMN */}
      <section className="pb-16 md:pb-24 bg-background">
        <div className="container-luxury grid md:grid-cols-12 gap-10 md:gap-14">
          {/* The reading-start column: everything that is written about the
              piece. Seven of twelve, where it used to be two of five — the
              photograph was the wider half and the words were a margin. */}
          <div className="md:col-span-7 order-2 md:order-1 flex flex-col gap-6 md:gap-8">
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
                              : "border-foreground/55 hover:border-foreground"
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
              <InfoCard title={t("sections.about")}>
                <div className="space-y-5">
                  {item.description.map((p, i) => (
                    <p key={i} dir="auto" className="text-foreground text-body">
                      {p}
                    </p>
                  ))}
                </div>
              </InfoCard>
            )}

            {item.highlights.length > 0 && (
              <InfoCard title={t("sections.highlights")}>
                <ul className="space-y-4">
                  {item.highlights.map((h, i) => (
                    <li key={i} className="flex gap-3">
                      <Check className="w-5 h-5 text-accent mt-1 shrink-0" aria-hidden="true" />
                      <div dir="auto" className="text-foreground font-normal text-body leading-relaxed">
                        {typeof h === "string" ? h : h.title}
                        {typeof h !== "string" && h.desc && (
                          <span className="text-muted-foreground">, {h.desc}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            )}

            {/* The exact sizes the owner typed, one to a row. A single line of
                text — "אורך 240 ס״מ · עומק 92" — is what this was, and it read
                as a sentence rather than as a specification. Each value is
                isolated, or "320 × 260" comes out as "260 × 320" in a Hebrew
                line. */}
            {sizeRows.length > 0 && (
              <InfoCard title={t("sections.dimensions")}>
                <dl className="divide-y divide-border">
                  {sizeRows.map((size, i) => (
                    <div
                      key={i}
                      className="flex items-baseline justify-between gap-6 py-3 first:pt-0 last:pb-0"
                    >
                      <dt dir="auto" className="text-body text-foreground-soft">
                        {size.label}
                      </dt>
                      <dd className="text-body text-foreground">
                        <Ltr>{size.value}</Ltr>
                      </dd>
                    </div>
                  ))}
                </dl>
              </InfoCard>
            )}

            {/* What it is made of, and a way through to what that means. Each
                row goes to that material on /materials, which scrolls to it
                and lights it up — the list used to be words with no way to
                find out anything about them. */}
            {productMaterials.length > 0 && (
              <InfoCard title={t("sections.materials")}>
                <ul role="list" className="divide-y divide-border">
                  {productMaterials.map((m) => (
                    <li key={m.id}>
                      <Link
                        to={`${to("/materials")}#${m.slug}`}
                        className="group flex items-center gap-4 py-3 first:pt-0 last:pb-0 transition-colors"
                      >
                        {m.thumb && (
                          <img
                            src={m.thumb}
                            alt=""
                            width={96}
                            height={96}
                            loading="lazy"
                            decoding="async"
                            className="h-12 w-12 shrink-0 rounded-[2px] object-cover"
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          {/* Isolated rather than dir="auto": a material named
                              in Latin — PolyStone — would otherwise turn its
                              own row left-aligned in a right-to-left list. */}
                          <span className="block text-body text-foreground transition-colors group-hover:text-accent">
                            <bdi>{materialName(m, lang)}</bdi>
                          </span>
                          {materialTagline(m, lang) && (
                            <span className="block line-clamp-1 text-label text-muted-foreground">
                              <bdi>{materialTagline(m, lang)}</bdi>
                            </span>
                          )}
                        </span>
                        <DirectionalArrow className="w-4 h-4 shrink-0 text-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            )}

            {item.description.length === 0 &&
              item.highlights.length === 0 &&
              productMaterials.length === 0 &&
              sizeRows.length === 0 && (
                <div className="flex min-h-[320px] items-center justify-center rounded-sm border border-border bg-card p-6 text-body text-muted-foreground md:p-8">
                  {t("sections.more")}
                </div>
              )}
          </div>

          {/* The reading-end column: the name, then the photographs.
              The name used to be centred across the whole page above both
              columns, which left it belonging to neither. Above the photograph
              it reads as the label of the thing you are looking at.

              dir="ltr" on the block, not on the page: every product is named
              in Latin letters, so the lockup starts at the left in Hebrew as
              well as in English. The tagline keeps dir="auto" inside it, so a
              Hebrew line still runs right to left within a left-set block. */}
          {/* Sticky: the words are now the taller column, and a photograph
              that scrolls away leaves you reading about a piece you can no
              longer see. */}
          <div className="md:col-span-5 order-1 md:order-2 md:sticky md:top-28 md:self-start">
            <div dir="ltr" className="mb-6 text-start md:mb-8">
              {item.tag && (
                <p dir="auto" className="mb-3 text-label text-muted-foreground">
                  {item.tag}
                </p>
              )}
              <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
                {displayName}
              </h1>
              {item.tagline && (
                <p dir="auto" className="mt-3 text-body italic leading-relaxed text-foreground-soft">
                  {item.tagline}
                </p>
              )}
              {/* Only when there is one. Most pieces are made to order and
                  carry no price at all, and an empty price line reads as an
                  error. */}
              {formatPrice(item.price) && (
                <p className="mt-3 text-body text-foreground" dir="ltr">
                  {formatPrice(item.price)}
                </p>
              )}
            </div>

            {/* Mobile: horizontal carousel */}
            {/* Bleed must match container-luxury's own padding (px-5 → sm:px-6)
                exactly, or the scroller overhangs the viewport at 375px. */}
            <div className="md:hidden flex overflow-x-auto gap-4 snap-x -mx-5 px-5 sm:-mx-6 sm:px-6 pb-2">
              {galleryImages.map((img, i) => (
                // A lone photo takes the full width. At 85% — the peek that
                // says "swipe" — a single square sat off to one side with
                // nothing to swipe to.
                <div
                  key={i}
                  className={`shrink-0 snap-start ${galleryImages.length > 1 ? "w-[85%] sm:w-[60%]" : "w-full"}`}
                >
                  {/* The same square as the tile that was tapped to get here.
                      See the desktop frame below. */}
                  <div className="relative overflow-hidden rounded-sm aspect-square bg-secondary">
                    <img
                      src={img}
                      alt={t("imageAlt", { name: displayName, index: i + 1 })}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: main image + thumbs column to the left */}
            <div className="hidden md:flex gap-4 h-full">
              {/* Main image (appears on the right within left column, RTL) */}
              <div className="flex-1 order-1">
                {/* A square, showing exactly the square of the tile that was
                    clicked to get here, with the piece centred in it.

                    It was a tall box with the whole uploaded file contained in
                    it — every photo a different shape, letterboxed on a grey
                    mat that matched none of their backdrops. The photos from
                    before the crop window arrive here already squared around
                    the furniture (lib/framed-photos); the ones since are
                    squares the owner framed. Either way `cover` on a square
                    crops nothing. */}
                <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
                  {!galleryImages.length && <TileFallback name={displayName} />}
                  {galleryImages[activeImage] && (
                    <img
                      src={galleryImages[activeImage]}
                      alt={t("imageAlt", { name: displayName, index: activeImage + 1 })}
                      loading="eager"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
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
                      aria-label={t("imageLabel", { index: i + 1 })}
                      // Which one is on screen was carried by a ring and an
                      // opacity step and nothing else, so a screen reader heard
                      // "image 1, button, image 2, button" with no way to tell
                      // where it was — and pressing one gave no feedback at
                      // all. The finish swatches on this same page already do
                      // this properly.
                      aria-pressed={activeImage === i}
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
      <section className="py-20 md:py-24 band-tint">
        <div className="container-luxury flex flex-col items-center text-center">
          {/* Charcoal, not terracotta: 3.1:1 on this band is under AA. */}
          <p className="text-body text-foreground-soft mb-4">{t("ctaEyebrow")}</p>
          <h2 className="font-display font-normal text-3xl md:text-5xl text-foreground leading-tight">
            {t("leaveDetails")}
          </h2>
          <div className="w-20 h-[2px] bg-foreground/15 my-5" aria-hidden="true" />
          <p className="text-body font-normal leading-relaxed text-foreground max-w-xl mx-auto mb-10">
            {t("bespokeNote")}
          </p>
          <Button asChild size="lg">
            <Link to={to("/faq") + "#contact"} className="inline-flex items-center gap-2">
              {t("leaveDetailsCta")}
              <DirectionalArrow className="w-4 h-4" animate={false} />
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
            {/* The collection page's own tile: the same square, the same name
                under it. These were bordered 4:3 cards from an older pass,
                which cropped a different rectangle out of each photo than the
                square the visitor had just been looking at. */}
            <ul role="list" className="tile-grid grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-3">
              {related.map((c) => (
                <li key={c.slug}>
                  <TileCard
                    to={to(`/products/${c.slug}`)}
                    image={c.cover_url}
                    fallback={<TileFallback name={productName(lang, c.name, c.name_en)} />}
                    alt=""
                    title={productName(lang, c.name, c.name_en)}
                    meta={c.tagline}
                    aspect="square"
                    align="center"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default CollectionDetailPage;
