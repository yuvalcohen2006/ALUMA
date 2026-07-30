import { useEffect, useState } from "react";
import { ArrowLeft, Box, Check, Copy, ScanLine, Smartphone } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ShineButton from "@/components/ui/shine-button";
import ShineAction from "@/components/ui/shine-action";
import { waLink } from "@/lib/whatsapp";
import { demoProducts } from "@/data/demoCollections";

/**
 * The viewing room.
 *
 * This page used to serve three sample meshes hosted on modelviewer.dev — a
 * generic sofa, chair and table that were not Aluma's, shown to customers as if
 * they were. Those are gone. It now renders ONLY models we generated from our
 * own product renders, and if a piece has no model it simply isn't offered.
 * Nothing here is ever a stand-in for a real product.
 *
 * The stage is the page's one charcoal band: the object sits lit on a dark
 * plinth, which is both how a showroom presents a piece and the only background
 * that doesn't fight a rendered mesh.
 */

/**
 * Products with a real GLB in public/models/.
 *
 * Adding one is: drop <slug>.glb into public/models/, add the slug here. The
 * name, blurb and poster all come from the catalogue, so nothing is duplicated
 * and nothing can drift. `arScale: "fixed"` pins the model to its true size in
 * the room — right for furniture, where scale IS the question being asked.
 *
 * iOS note: Quick Look needs USDZ, which we don't produce. Without it iPhone
 * users get the 3D viewer but not in-room placement, and the copy below says so
 * rather than letting the button fail silently.
 */
const AR_SLUGS: string[] = [];

type ARProduct = {
  slug: string;
  name: string;
  tagline: string | null;
  poster: string | null;
  glb: string;
};

const arProducts: ARProduct[] = AR_SLUGS.map((slug) => {
  const p = demoProducts.find((d) => d.slug === slug);
  return p
    ? {
        slug,
        name: p.name,
        tagline: p.tagline,
        poster: p.cover_url,
        glb: `/models/${slug}.glb`,
      }
    : null;
}).filter((p): p is ARProduct => p !== null);

const STEPS = [
  { icon: Smartphone, text: "פותחים את העמוד בטלפון" },
  { icon: ScanLine, text: "מקישים על הצגה במרחב" },
  { icon: Box, text: "מכוונים לרצפה, והרהיט עומד בגודל אמיתי" },
];

/** Desktop has no camera to place anything with — hand the page to the phone. */
const HandoffToPhone = () => {
  const [copied, setCopied] = useState(false);
  const url = "https://alumaoutdoor.com/ar";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the address is on screen to type */
    }
  };

  return (
    <div className="rounded-[14px] border border-border bg-background p-6 md:p-8 text-right">
      <h2 className="font-display font-normal text-card text-foreground">
        להצבה במרחב, פתחו בטלפון
      </h2>
      <p className="text-lede text-muted-foreground mt-2 max-w-xl">
        התצוגה התלת־ממדית עובדת גם כאן, אבל כדי להעמיד את הרהיט בחצר צריך את
        מצלמת הטלפון. שלחו לעצמכם את הכתובת:
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <code
          dir="ltr"
          className="rounded-[10px] border border-border bg-secondary/50 px-4 py-2.5 text-meta text-foreground"
        >
          {url}
        </code>
        <ShineAction onClick={copy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "הועתק" : "העתקת הקישור"}
        </ShineAction>
      </div>
    </div>
  );
};

const ARPreview = () => {
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<ARProduct | null>(arProducts[0] ?? null);

  useEffect(() => {
    if (arProducts.length === 0) return;
    // Lazy-load Google's <model-viewer> web component
    const existing = document.querySelector(
      'script[data-mv="true"]'
    ) as HTMLScriptElement | null;
    if (existing) {
      setReady(true);
      return;
    }
    const s = document.createElement("script");
    s.type = "module";
    s.src =
      "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
    s.dataset.mv = "true";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  return (
    <Layout>
      <SEO
        title="תצוגה במרחב | ראו ריהוט חוץ אצלכם בחצר | Aluma"
        description="הציבו ספות, כורסאות ושולחנות חוץ של Aluma בגינה או במרפסת שלכם בתצוגה תלת־ממדית, ישירות מהדפדפן בטלפון."
        path="/ar"
      />

      <PageHero
        title="תצוגה במרחב שלכם"
        subtitle="בוחרים פריט, מכוונים את מצלמת הטלפון לרצפה, והרהיט עומד בחצר בגודל האמיתי שלו — לפני שהזמנתם."
      />

      {/* ── The stage: the page's one charcoal band ── */}
      <section className="relative grain py-12 md:py-16 bg-foreground">
        <div className="container-luxury">
          {arProducts.length > 0 && active ? (
            <>
              <Reveal>
                <div className="rounded-[14px] overflow-hidden border border-background/15 bg-background/[0.04]">
                  <div className="aspect-[4/3] md:aspect-[16/10] w-full">
                    {ready ? (
                      <model-viewer
                        key={active.slug}
                        src={active.glb}
                        alt={active.name}
                        poster={active.poster || undefined}
                        ar
                        ar-modes="webxr scene-viewer"
                        ar-scale="fixed"
                        ar-placement="floor"
                        camera-controls
                        touch-action="pan-y"
                        shadow-intensity="1"
                        exposure="1"
                        environment-image="neutral"
                        auto-rotate
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "transparent",
                        }}
                      >
                        <button
                          slot="ar-button"
                          className="btn-shine btn-shine-invert absolute bottom-5 left-1/2 -translate-x-1/2"
                        >
                          <ScanLine className="h-4 w-4" />
                          הצגה במרחב שלי
                        </button>
                      </model-viewer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-meta text-background/60">
                        טוען תצוגה תלת־ממדית…
                      </div>
                    )}
                  </div>

                  {/* Spec footer */}
                  <div className="p-6 md:p-8 border-t border-background/15 flex flex-col md:flex-row md:items-end md:justify-between gap-5 text-right">
                    <div className="min-w-0">
                      <h2 className="font-display font-normal text-card text-background">
                        {active.name}
                      </h2>
                      {active.tagline && (
                        <p className="text-meta text-background/70 mt-1.5">
                          {active.tagline}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-5 shrink-0">
                      <ShineButton to={`/collections/${active.slug}`} invert>
                        לפרטים על הפריט
                        <ArrowLeft className="h-4 w-4" />
                      </ShineButton>
                      <a
                        href={waLink(active.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-meta text-background/85 hover:text-background link-underline"
                      >
                        שאלה על הפריט
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Picker — only rendered when there is a choice to make */}
              {arProducts.length > 1 && (
                <Reveal delay={120}>
                  <ul className="rail-scroll mt-8 flex gap-4 overflow-x-auto pb-2">
                    {arProducts.map((p) => {
                      const isActive = p.slug === active.slug;
                      return (
                        <li key={p.slug} className="shrink-0 w-[152px] sm:w-[180px]">
                          <button
                            type="button"
                            onClick={() => setActive(p)}
                            aria-pressed={isActive}
                            className="block w-full text-right"
                          >
                            <div
                              className={`relative aspect-square rounded-[10px] overflow-hidden border transition-all duration-300 ${
                                isActive
                                  ? "border-background/60 shadow-luxury"
                                  : "border-background/15 hover:border-background/35"
                              }`}
                            >
                              {p.poster && (
                                <img
                                  src={p.poster}
                                  alt=""
                                  width={512}
                                  height={512}
                                  loading="lazy"
                                  decoding="async"
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <span
                              className={`mt-2.5 block text-meta ${
                                isActive ? "text-background" : "text-background/70"
                              }`}
                            >
                              {p.name}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </Reveal>
              )}
            </>
          ) : (
            /* No models yet. Say so plainly rather than showing someone else's
               furniture — which is exactly what this page used to do. */
            <Reveal>
              <div className="rounded-[14px] border border-background/15 bg-background/[0.04] p-8 md:p-12 text-right">
                <h2 className="font-display font-normal text-card text-background">
                  התצוגה התלת־ממדית בהכנה
                </h2>
                <p className="text-lede text-background/75 mt-3 max-w-2xl">
                  אנחנו בונים מודלים תלת־ממדיים של הפריטים שלנו, כדי שתוכלו
                  להעמיד אותם בחצר לפני שהזמנתם. עד שיהיו מוכנים, נשמח להראות לכם
                  הכול באולם התצוגה ביציץ — ולהגיע איתכם למידות המדויקות.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-5">
                  <ShineButton to="/collections" invert>
                    לצפייה בקולקציות
                    <ArrowLeft className="h-4 w-4" />
                  </ShineButton>
                  <a
                    href={waLink("תצוגה במרחב")}
                    target="_blank"
                    rel="noreferrer"
                    className="text-meta text-background/85 hover:text-background link-underline"
                  >
                    דברו איתנו
                  </a>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── How it works + the desktop hand-off ── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-luxury space-y-10 md:space-y-14">
          <Reveal>
            <ul className="flex flex-col md:flex-row md:items-center gap-5 md:gap-0 text-right">
              {STEPS.map((step, i) => (
                <li
                  key={step.text}
                  className="flex items-center gap-4 md:flex-1 min-w-0"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-border bg-secondary/60 text-primary">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-meta text-foreground min-w-0">{step.text}</span>
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden md:block h-px flex-1 bg-border ms-4"
                    />
                  )}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Desktop was a dead end here — no camera, no explanation. */}
          <Reveal delay={120} className="hidden lg:block">
            <HandoffToPhone />
          </Reveal>

          <Reveal delay={160}>
            <p className="text-meta text-muted-foreground text-right max-w-3xl">
              הצבה במרחב זמינה במכשירי <bdi dir="ltr">Android</bdi> התומכים
              ב־<bdi dir="ltr">ARCore</bdi>. ב־<bdi dir="ltr">iPhone</bdi> התצוגה
              היא תלת־ממדית במסך, ולהצבה בחצר נשמח לארח אתכם באולם התצוגה.
            </p>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default ARPreview;
