import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ProductCell, { productTransitionName } from "@/components/ProductCell";
import ProductGallery from "@/components/product/ProductGallery";
import ShowroomVisit from "@/components/product/ShowroomVisit";
import { materialSlug } from "@/components/product/materialLink";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Layers, Ruler } from "lucide-react";
import NotFound from "./NotFound";
import { supabase } from "@/integrations/supabase/client";
import type { DBProduct } from "@/hooks/useCollectionsData";
import FavoriteButton from "@/components/FavoriteButton";
import { trackPixel } from "@/lib/pixel";
import { waLink } from "@/lib/whatsapp";

const SITE = "https://alumaoutdoor.com";

/** Anchor the sticky panel's quiet link scrolls to. */
const VISIT_ID = "showroom-visit";

/** Product columns, one string so every query on this page selects the same shape. */
const PRODUCT_COLUMNS =
  "id, collection_id, slug, name, tag, tagline, description, highlights, materials, dimensions, cover_url, gallery";

/** The collection a product belongs to, plus enough to find its neighbours. */
type CollectionRef = { id: string; slug: string; name_he: string };

/** A row as Postgres hands it back, before its jsonb columns are hardened. */
type RawProduct = Record<string, unknown>;

/** Every jsonb column can come back null; every array field is guaranteed here. */
const normalise = (row: RawProduct): DBProduct => ({
  ...(row as unknown as DBProduct),
  description: Array.isArray(row.description) ? (row.description as string[]) : [],
  highlights: Array.isArray(row.highlights)
    ? (row.highlights as DBProduct["highlights"])
    : [],
  materials: Array.isArray(row.materials) ? (row.materials as string[]) : [],
  gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
});

/**
 * The page's section head: the shared 38px heading with the catalogue's
 * hairline running off it to the left (the RTL end). One device, repeated, so
 * the editorial half and the product grid below read as the same document.
 */
const RuledHeading = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
    <SectionHeading as="h2" align="start" className="min-w-0">
      {children}
    </SectionHeading>
    <span aria-hidden="true" className="h-px min-w-[48px] flex-1 bg-primary/25" />
  </div>
);

/**
 * One material. Links to the material's own page when we recognise the string,
 * and stays plain ink when we don't — the CMS field is free text, and a chip
 * that looks like a link but lands on a 404 is worse than a chip that doesn't.
 */
const MaterialChip = ({ name }: { name: string }) => {
  const slug = materialSlug(name);
  if (!slug) {
    return (
      <span className="inline-flex items-center rounded-[10px] border border-border bg-secondary/60 px-4 py-2 text-meta text-muted-foreground">
        {name}
      </span>
    );
  }
  return (
    <Link
      to={`/materials/${slug}`}
      // No hover shadow: the panel this sits in is a scroll container on short
      // viewports, which would clip it.
      className="group inline-flex items-center gap-2 rounded-[10px] border border-border bg-secondary px-4 py-2 text-meta text-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/60 hover:bg-secondary/60"
    >
      {name}
      {/* RTL: forward points left. */}
      <ArrowLeft
        className="h-[18px] w-[18px] shrink-0 text-primary/70 transition-transform duration-300 ease-out group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
};

const scrollToVisit = () => {
  const el = document.getElementById(VISIT_ID);
  if (!el) return;
  // index.css sets `html { scroll-behavior: smooth }`, and per CSSOM "auto"
  // defers to that — only "instant" actually overrides it.
  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
};

const CollectionDetailPage = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<DBProduct | null>(null);
  const [collection, setCollection] = useState<CollectionRef | null>(null);
  const [related, setRelated] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setLoadError(false);

    // The collections page runs on the placeholder catalogue in development, so
    // detail pages have to resolve from it too — otherwise every one of those
    // products 404s the moment you click it. `?live=1` opts back into the
    // database, and production never takes this path.
    const wantsLive =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("live");
    if (import.meta.env.DEV && !wantsLive) {
      const { demoCollections, demoProducts } = await import("@/data/demoCollections");
      const found = demoProducts.find((p) => p.slug === slug) ?? null;
      setItem(found);

      const ci = found
        ? demoCollections.findIndex((c) => c.id === found.collection_id)
        : -1;
      setCollection(ci >= 0 ? demoCollections[ci] : null);

      let rel = found
        ? demoProducts
            .filter((p) => p.collection_id === found.collection_id && p.id !== found.id)
            .slice(0, 3)
        : [];
      // A collection with only one or two pieces still deserves a full row, so
      // the shortfall is made up from the collections either side of it.
      if (found && rel.length < 3) {
        for (const neighbour of [demoCollections[ci + 1], demoCollections[ci - 1]]) {
          if (!neighbour || rel.length >= 3) continue;
          rel = rel.concat(
            demoProducts
              .filter((p) => p.collection_id === neighbour.id)
              .slice(0, 3 - rel.length)
          );
        }
      }
      setRelated(rel);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("site_collection_products")
      .select(PRODUCT_COLUMNS)
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
      const p = normalise(data as unknown as RawProduct);
      setItem(p);

      const { data: rel } = await supabase
        .from("site_collection_products")
        .select(PRODUCT_COLUMNS)
        .eq("collection_id", p.collection_id)
        .eq("published", true)
        .neq("id", p.id)
        .limit(3);

      // The whole published collection list in one call: it names this
      // product's collection for the breadcrumb AND gives the ordering the
      // padding below needs, without a second round trip.
      const { data: cols } = await supabase
        .from("site_collections")
        .select("id, slug, name_he, sort_order")
        .eq("published", true)
        .order("sort_order");
      const colList = ((cols as unknown as CollectionRef[]) || []).filter(Boolean);
      const ci = colList.findIndex((c) => c.id === p.collection_id);
      setCollection(ci >= 0 ? colList[ci] : null);

      let relList = ((rel ?? []) as unknown as RawProduct[]).map(normalise);
      if (relList.length < 3 && ci >= 0) {
        const neighbours = [colList[ci + 1], colList[ci - 1]]
          .filter(Boolean)
          .map((c) => c.id);
        if (neighbours.length > 0) {
          const { data: extra } = await supabase
            .from("site_collection_products")
            .select(PRODUCT_COLUMNS)
            .in("collection_id", neighbours)
            .eq("published", true)
            .limit(3 - relList.length);
          relList = relList.concat(
            ((extra ?? []) as unknown as RawProduct[]).map(normalise)
          );
        }
      }
      setRelated(relList);
    } else {
      setItem(null);
      setCollection(null);
      setRelated([]);
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
        {/* A skeleton rather than a centred "טוען…", because of the view
            transition. React Router captures the new DOM the moment the
            navigation commits — before this component's effect has run, let
            alone before Supabase answers. A page that renders only a line of
            text at that instant has no element carrying the product's
            transition name, so the browser finds no partner for the grid
            thumbnail and degrades the pair to a plain fade. Naming the sand
            frame here gives the photograph something to fly into, and the real
            gallery inherits the name when it mounts a moment later.

            Same box as ProductCell's frame and the gallery plate: 4:3, 14px
            radius, hairline border, sand fill. */}
        <section className="bg-background pt-[127px] pb-16 md:pb-24">
          <div className="container-luxury">
            <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-8 lg:gap-14 items-start">
              <div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] border border-border bg-secondary"
                style={
                  slug
                    ? ({
                        viewTransitionName: productTransitionName(slug),
                      } as React.CSSProperties)
                    : undefined
                }
              />
              <div className="min-w-0" aria-hidden="true">
                <div className="h-9 w-2/3 rounded-[10px] bg-secondary" />
                <div className="mt-4 h-6 w-1/2 rounded-[10px] bg-secondary/70" />
                <div className="mt-8 h-px w-full bg-border" />
                <div className="mt-8 h-6 w-5/6 rounded-[10px] bg-secondary/70" />
                <div className="mt-3 h-6 w-3/4 rounded-[10px] bg-secondary/70" />
              </div>
            </div>
            <p className="sr-only" role="status">
              טוען את הפריט…
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-6">
          <p className="text-[20px] leading-relaxed text-muted-foreground max-w-md">
            אירעה שגיאה בטעינת הפריט. בדקו את החיבור ונסו שוב.
          </p>
          <Button onClick={load} variant="outline" className="rounded-[10px] text-[18px] px-6">
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

  const collectionName = collection?.name_he ?? null;
  const waContext = collectionName
    ? `${item.name} מקולקציית ${collectionName}`
    : item.name;

  const hasStory = item.description.length > 0;
  const hasHighlights = item.highlights.length > 0;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    description: item.tagline ?? "",
    image: galleryImages.length > 0 ? galleryImages : item.cover_url ?? undefined,
    brand: { "@type": "Brand", name: "Aluma" },
    category: item.tag ?? undefined,
    material: item.materials.join(", "),
    url: `${SITE}/collections/${item.slug}`,
    offers: {
      "@type": "Offer",
      // Made-to-order / quote-based: no fixed price. A fake "0" + InStock is
      // invalid structured data, so we signal pre-order and omit the price.
      availability: "https://schema.org/PreOrder",
      url: `${SITE}/contact`,
      description: "מחיר לפי הצעת מחיר אישית",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "בית", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "קולקציות", item: `${SITE}/collections` },
      ...(collection
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: collection.name_he,
              item: `${SITE}/collections?cat=${collection.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: collection ? 4 : 3,
        name: item.name,
        item: `${SITE}/collections/${item.slug}`,
      },
    ],
  };

  return (
    <Layout>
      {/* title / description / path are the originals, untouched. `image` and
          `type` are additions: without them every product on the site shared
          one generic og-image.jpg, so a piece shared to WhatsApp showed a
          stranger's sofa. */}
      <SEO
        title={`${item.name} | קולקציות | Aluma`}
        description={`${item.name}, ${item.tagline ?? ""}. ${item.description[0] ?? ""}`}
        path={`/collections/${item.slug}`}
        image={item.cover_url ?? undefined}
        type="product"
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />

      {/* ===== BREADCRUMB =====
          No PageHero on this page — the product name is the h1 and it lives in
          the panel beside the photograph — so this row carries the header
          clearance PageHero would have, at exactly the same 127px. */}
      <section className="bg-background pt-[127px] pb-6 md:pb-8">
        <div className="container-luxury">
          <nav
            aria-label="מיקום בקטלוג"
            className="flex flex-wrap items-center gap-y-2 text-meta text-muted-foreground"
          >
            <Link
              to="/collections"
              className="group inline-flex items-center gap-2 transition-colors hover:text-accent"
            >
              {/* RTL: back points right. */}
              <ArrowRight
                className="h-[18px] w-[18px] transition-transform duration-300 ease-out group-hover:translate-x-1"
                aria-hidden="true"
              />
              <span className="link-underline">חזרה לקולקציות</span>
            </Link>

            {collection && (
              <>
                {/* The rule travels inside the item it follows, so a wrap can
                    only ever leave it at the end of a line. */}
                <span aria-hidden="true" className="mx-3 h-4 w-px shrink-0 bg-primary/45" />
                <Link
                  to={`/collections?cat=${collection.slug}`}
                  className="link-underline transition-colors hover:text-accent"
                >
                  {collection.name_he}
                </Link>
              </>
            )}
          </nav>
        </div>
      </section>

      {/* ===== MEDIA + PANEL =====
          RTL: the gallery is the first grid child, so the photograph lands on
          the right, under the breadcrumb, and the panel rides alongside it on
          the left and stays put while the photography scrolls. */}
      <section className="bg-background pb-16 md:pb-24">
        <div className="container-luxury grid items-start gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
          {/* Deliberately NOT wrapped in <Reveal>: the plate is above the fold,
              and .reveal starts at opacity 0 / translateY(28px) — which is
              exactly the state a cross-document view transition would capture
              the incoming image in. */}
          <div className="min-w-0">
            {/* Keyed by slug so a jump straight from one product page to
                another (the grid at the foot of this page does exactly that)
                cannot leave the gallery holding the previous product's active
                thumbnail index. The name itself comes from ProductCell so the
                two halves of the pair can never drift apart. */}
            <ProductGallery
              key={item.slug}
              images={galleryImages}
              name={item.name}
              transitionName={productTransitionName(item.slug)}
            />
          </div>

          {/* The panel has to clear the header (top-28) AND still fit a short
              laptop viewport, or a product with three materials and a wrapped
              name leaves its CTA below the fold for as long as the column is
              stuck. The max-height costs nothing while the panel fits. */}
          <Reveal
            delay={120}
            className="rail-scroll min-w-0 lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto"
          >
            {item.tag && (
              <p className="text-meta text-muted-foreground">{item.tag}</p>
            )}

            {/* PageHero's voice, inline: the rule measures exactly as wide as
                the words, so a long product name wraps and the rule follows it
                instead of overflowing the panel. */}
            <div className={`w-fit max-w-full ${item.tag ? "mt-3" : ""}`}>
              <h1 className="animate-rise-in font-display text-3xl sm:text-4xl md:text-5xl text-primary">
                {item.name}
              </h1>
              <span className="mt-4 block h-px w-full bg-primary/50" aria-hidden="true" />
            </div>

            {item.tagline && (
              <p className="mt-5 text-lede text-foreground-soft text-pretty">
                {item.tagline}
              </p>
            )}

            {/* The favourite anchors the right edge and a hairline runs off it
                to the left, so a lone 40px square never floats in the panel. */}
            <div className="mt-7 flex items-center gap-4">
              <FavoriteButton
                productId={item.id}
                collectionSlug={item.slug}
                size="md"
                variant="inline"
                className="shrink-0 rounded-[10px]"
              />
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>

            {/* ---- SPEC LEDGER ---- */}
            {(item.dimensions || item.materials.length > 0) && (
              <dl className="mt-8 divide-y divide-border border-y border-border">
                {item.dimensions && (
                  <div className="flex gap-4 py-5">
                    <Ruler
                      className="mt-1 h-[18px] w-[18px] shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <dt className="text-meta text-muted-foreground">מידות בסיס</dt>
                      <dd className="mt-1.5 text-meta text-foreground">{item.dimensions}</dd>
                    </div>
                  </div>
                )}

                {item.materials.length > 0 && (
                  <div className="flex gap-4 py-5">
                    <Layers
                      className="mt-1 h-[18px] w-[18px] shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <dt className="text-meta text-muted-foreground">חומרים</dt>
                      <dd className="mt-3 flex flex-wrap gap-2.5">
                        {item.materials.map((m, i) => (
                          <MaterialChip key={`${i}-${m}`} name={m} />
                        ))}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            )}

            {/* ---- CTA STACK ---- */}
            <p className="mt-8 text-meta leading-relaxed text-muted-foreground">
              כל פריט מיוצר בהתאמה אישית, והמחיר נקבע לפי המידות, החומרים והגימור
              שתבחרו.
            </p>

            <div className="mt-6 flex flex-col items-start gap-5">
              {/* An <a> styled as a ShineButton: ShineButton is a router Link
                  and this leaves the site. */}
              <a
                href={waLink(waContext)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine w-full sm:w-auto"
              >
                לתיאום ותמחור
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={scrollToVisit}
                className="link-underline text-meta text-accent transition-smooth"
              >
                לתיאום ביקור באולם התצוגה
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== THE WRITING =====
          Out of the boxes: prose on the page background, under the same ruled
          heading the grid below uses. */}
      {(hasStory || hasHighlights) && (
        <section className="bg-background pb-16 md:pb-24">
          <div className="container-luxury">
            <div className="h-px bg-border" aria-hidden="true" />
            <div
              className={`grid gap-12 pt-14 md:pt-20 lg:gap-16 ${
                hasStory && hasHighlights
                  ? "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
                  : ""
              }`}
            >
              {hasStory && (
                <Reveal className="min-w-0">
                  <RuledHeading>על הפריט</RuledHeading>
                  <div className="mt-7 max-w-[62ch] space-y-5">
                    {item.description.map((p, i) => (
                      <p key={i} className="text-body text-foreground text-pretty">
                        {p}
                      </p>
                    ))}
                  </div>
                </Reveal>
              )}

              {hasHighlights && (
                <Reveal delay={120} className="min-w-0">
                  <RuledHeading>נקודות עיצוב</RuledHeading>
                  <ul className="mt-7 divide-y divide-border border-t border-border">
                    {item.highlights.map((h) => (
                      <li key={h.title} className="flex gap-4 py-5">
                        <span
                          aria-hidden="true"
                          className="mt-[15px] h-px w-6 shrink-0 bg-primary/60"
                        />
                        <div className="min-w-0">
                          <p className="font-display text-[22px] font-normal leading-snug text-foreground">
                            {h.title}
                          </p>
                          {h.desc && (
                            <p className="mt-2 text-meta leading-relaxed text-muted-foreground text-pretty">
                              {h.desc}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== THE ONE CHARCOAL BAND ===== */}
      <ShowroomVisit id={VISIT_ID} productName={item.name} />

      {/* ===== COMPLETE THE SET =====
          The catalogue's own cell and the catalogue's own grid, so a piece
          looks and behaves here exactly as it does on /collections. */}
      {related.length > 0 && (
        <section className="bg-background py-20 md:py-28">
          <div className="container-luxury">
            <Reveal>
              <RuledHeading>השלימו את הסט</RuledHeading>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:mt-12 md:gap-y-12 lg:grid-cols-3 lg:gap-x-7">
              {related.map((p, i) => (
                <ProductCell
                  key={p.slug}
                  product={p}
                  index={i}
                  lead={i === 0}
                  eager={false}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default CollectionDetailPage;
