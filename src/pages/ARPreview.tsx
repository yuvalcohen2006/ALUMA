import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Smartphone, Box, ScanLine, Info } from "lucide-react";
import Layout from "@/components/Layout";

// Demo products, placeholder GLB/USDZ models hosted on modelviewer.dev.
// Replace `glb` / `usdz` URLs later with Aluma's own scanned models.
const products = [
  {
    id: "modular-sofa-3m",
    name: "ספה מודולרית ⁦3×1⁩ מ׳",
    desc: "ספה מודולרית 3 יחידות, רוחב 3 מטר, עומק 1 מטר. תצוגת AR בגודל אמיתי.",
    glb: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Sofa/glTF-Binary/Sofa.glb",
    usdz: "",
    poster: "",
    arScale: "fixed" as const,
  },
  {
    id: "chair",
    name: "כורסת Sunbrella Lounge",
    desc: "כורסת חוץ מרופדת בבד Sunbrella, שלד אלומיניום מוברש.",
    glb: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Chair/glTF-Binary/Chair.glb",
    usdz: "https://modelviewer.dev/shared-assets/models/Chair.usdz",
    poster: "",
    arScale: "auto" as const,
  },
  {
    id: "sofa",
    name: "ספת Skyline",
    desc: "ספה מודולרית 3 מושבים, קולקציית Skyline.",
    glb: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Sofa/glTF-Binary/Sofa.glb",
    usdz: "",
    poster: "",
    arScale: "auto" as const,
  },
  {
    id: "table",
    name: "שולחן Stone Top",
    desc: "שולחן חוץ עם משטח גרניט פורצלן ⁦220x100⁩.",
    glb: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Table/glTF-Binary/Table.glb",
    usdz: "",
    poster: "",
    arScale: "auto" as const,
  },
];

const ARPreview = () => {
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(products[0]);

  useEffect(() => {
    document.title = "AR Preview, נסו את הרהיט במרחב שלכם | Aluma";
    const meta =
      document.querySelector('meta[name="description"]') ||
      Object.assign(document.createElement("meta"), { name: "description" });
    (meta as HTMLMetaElement).content =
"תצוגת מציאות רבודה, מקמו רהיטי חוץ של Aluma במרפסת או בגינה שלכם דרך הסמארטפון.";
    if (!meta.parentNode) document.head.appendChild(meta);

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
        title="תצוגת AR, ראו ריהוט חוץ במציאות רבודה | Aluma"
        description="הציבו ספות, כורסאות ושולחנות חוץ של Aluma בגינה או במרפסת שלכם בעזרת תצוגת AR ישירות מהדפדפן בטלפון."
        path="/ar"
      />

      <div className="pt-32 pb-20">
        <section className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-label tracking-[0.3em] uppercase text-accent">
              AR · Augmented Reality
            </span>
            <h1 className="font-display text-4xl md:text-6xl text-foreground mt-3 mb-4">
              תראו את הרהיט במרחב שלכם
            </h1>
            <p className="text-foreground max-w-2xl mx-auto leading-relaxed">
              בחרו פריט, לחצו על כפתור ה-AR בפינת התצוגה,
              וכוונו את המצלמה לרצפה במרפסת או בגינה, הרהיט יופיע בגודל אמיתי.
              עובד על iPhone (iOS 12+) ועל אנדרואיד תומך ARCore.
            </p>
          </div>

          {/* Product picker */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p)}
                className={`px-5 py-2.5 rounded-sm text-sm font-medium transition-smooth border ${
                  active.id === p.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-foreground/15"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Model viewer */}
          <div className="bg-secondary/30 border border-border rounded-sm overflow-hidden ">
            <div className="aspect-[4/3] md:aspect-[16/10] w-full bg-secondary">
              {ready ? (
                <model-viewer
                  key={active.id}
                  src={active.glb}
                  ios-src={active.usdz || undefined}
                  alt={active.name}
                  poster={active.poster || undefined}
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  ar-scale={active.arScale}
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
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm  text-sm font-medium"
                  >
                    <ScanLine className="h-4 w-4" />
                    הציגו במרחב שלי
                  </button>
                </model-viewer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  טוען תצוגת 3D…
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl text-foreground">{active.name}</h2>
                <p className="text-muted-foreground text-sm mt-1">{active.desc}</p>
              </div>
              <Button asChild variant="default">
                <a href="/faq#contact">לפרטים על הפריט</a>
              </Button>
            </div>
          </div>

          {/* How it works */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: Smartphone,
                title: "1 · פתחו במובייל",
                text: "iPhone או אנדרואיד, דפדפן Safari / Chrome.",
              },
              {
                icon: ScanLine,
                title: "2 · לחצו על AR",
                text: "כפתור 'הציגו במרחב שלי' בתחתית התצוגה.",
              },
              {
                icon: Box,
                title: "3 · מקמו בחלל",
                text: "כוונו לרצפה, גררו וסובבו את הרהיט בגודל אמיתי.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="bg-background border border-border rounded-sm p-6"
              >
                <step.icon className="h-6 w-6 text-accent mb-3" />
                <h3 className="font-display text-lg text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-start gap-3 bg-secondary/40 border border-border rounded-sm p-5">
            <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">שימו לב:</strong> הדגמים
              המוצגים כאן הם דגמי הדגמה כלליים, לא הריהוט שלנו. הם נועדו להראות
              איך התצוגה במרחב עובדת. כשיהיו לנו מודלים תלת-ממדיים של הקולקציות
              עצמן, תוכלו לראות כאן את הבד, הגוון והמידות המדויקות.
              התצוגה במרחב עובדת מהטלפון — באייפון דרך Safari, ובאנדרואיד דרך Chrome.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ARPreview;
