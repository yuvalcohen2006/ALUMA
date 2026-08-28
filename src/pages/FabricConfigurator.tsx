import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Check, MessageCircle, Sparkles } from "lucide-react";
import salonPhoto from "@/assets/collections/salon-monolith.jpg";
import { SITE } from "@/config/site";
import {
  sunbrellaFabrics,
  families,
  type SunbrellaFabric,
} from "@/data/sunbrella";
import { trackPixel } from "@/lib/pixel";
import ConversionCTA from "@/components/ConversionCTA";

const familyLabelsHe: Record<string, string> = {
  Canvas: "Canvas · צבעי בסיס",
  Heritage: "Heritage · מרקמים",
  Patterns: "Patterns · דוגמאות ופסים",
};

const FabricConfigurator = () => {
  const [family, setFamily] = useState<(typeof families)[number]>("Canvas");
  const [selected, setSelected] = useState<SunbrellaFabric>(
    sunbrellaFabrics[0]
  );

  const filtered = useMemo(
    () => sunbrellaFabrics.filter((f) => f.family === family),
    [family]
  );

  const waText = encodeURIComponent(
    `שלום Aluma, הייתי רוצה הצעת מחיר לספה עם בד Sunbrella: ${selected.nameHe} (${selected.code}).`
  );
  const whatsappUrl = `${SITE.whatsapp.href}?text=${waText}`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="בחרו את הבד, קונפיגורטור בדי Sunbrella לסלוני חוץ | Aluma"
        description="בחרו צבע ומרקם של בד Sunbrella וראו תצוגה מקדימה מיידית על ספת חוץ של Aluma. עשרות גוונים, עמיד UV, חיוני לריהוט גן ומרפסת."
        path="/fabric"
      />
      <Header />

      <main className="pt-32 pb-20">
        <section className="container mx-auto px-6 max-w-7xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <span className="text-label tracking-[0.3em] uppercase text-accent">
              Sunbrella · Fabric Configurator
            </span>
            <h1 className="font-display text-4xl md:text-6xl text-foreground mt-3 mb-4">
              בחרו את הבד למניפה שלכם
            </h1>
            <p className="text-foreground max-w-2xl mx-auto leading-relaxed">
              כל הבדים מתוך מניפת Sunbrella המקורית, עמידים ב-UV, דוחי מים,
              אחריות 5 שנים. בחרו משפחה, לחצו על דגימה, וראו מיד איך הספה תיראה
              עם הבד שבחרתם.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* LEFT: Live preview */}
            <div className="lg:col-span-3 lg:sticky lg:top-28 self-start">
              <div className="relative bg-secondary border border-border rounded-sm overflow-hidden ">
                {/* The old preview tinted six hand-positioned rectangles over a
                    photo that 404s in production, so it showed coloured blocks
                    floating on a broken image. Until the per-fabric renders
                    exist (masked inpainting from the real product photos), show
                    an honest large swatch beside a real sofa rather than a fake
                    recolour. */}
                <div className="relative">
                  <img
                    src={salonPhoto}
                    alt="סלון חוץ של Aluma"
                    width={1280}
                    height={960}
                    loading="eager"
                    className="w-full h-auto block"
                  />
                </div>

                <div className="p-5 border-b border-border">
                  <div
                    aria-hidden
                    className="h-28 w-full rounded-sm border border-border transition-all duration-500"
                    style={{ background: selected.background }}
                  />
                  <p className="mt-3 text-small leading-relaxed text-muted-foreground">
                    זהו הגוון עצמו. תצוגה של הבד על המוצר תיווצר מצילומי המוצרים
                    שלנו — עד אז, מוזמנים להזמין דוגמית בד אמיתית.
                  </p>
                </div>

                <div className="p-5 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-label tracking-[0.25em] uppercase text-accent">
                      Sunbrella · {selected.family}
                    </div>
                    <div className="font-display text-xl text-foreground mt-1">
                      {selected.nameHe}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5" dir="ltr">
                      {selected.name} · {selected.code}
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackPixel("InitiateCheckout", {
                        content_name: `בד Sunbrella, ${selected.nameHe}`,
                        content_category: "Fabric Configurator",
                        content_ids: [selected.code],
                      })
                    }
                  >
                    <Button variant="default" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      הצעת מחיר ב-WhatsApp
                    </Button>
                  </a>
                </div>
              </div>

              {/* Spec strip */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
"עמיד UV 1500+ שעות",
"דוחה מים ודוחה כתמים",
"אחריות 5 שנים",
                ].map((s) => (
                  <div
                    key={s}
                    className="bg-secondary/40 border border-border rounded-sm p-3 text-center text-xs text-muted-foreground"
                  >
                    <Sparkles className="h-3.5 w-3.5 inline text-accent mr-1" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Swatches fan */}
            <div className="lg:col-span-2">
              {/* Family tabs */}
              <div className="flex flex-wrap gap-2 mb-5">
                {families.map((fam) => (
                  <button
                    key={fam}
                    onClick={() => setFamily(fam)}
                    className={`px-4 py-2 rounded-sm text-sm font-medium transition-smooth border ${
                      family === fam
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-foreground/15"
                    }`}
                  >
                    {familyLabelsHe[fam]}
                  </button>
                ))}
              </div>

              <div className="text-xs text-muted-foreground mb-3">
                {filtered.length} דגימות במשפחה זו
              </div>

              {/* Swatch grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {filtered.map((f) => {
                  const isActive = selected.code === f.code;
                  return (
                    <button
                      key={f.code}
                      onClick={() => setSelected(f)}
                      className={`group relative aspect-square rounded-sm overflow-hidden border-2 transition-smooth ${
                        isActive
                          ? "border-accent  scale-[1.03]"
                          : "border-border hover:border-foreground/15"
                      }`}
                      aria-pressed={isActive}
                      aria-label={`${f.nameHe} ${f.code}`}
                    >
                      <span
                        className="absolute inset-0"
                        style={{ background: f.background }}
                      />
                      {isActive && (
                        <span className="absolute top-1.5 right-1.5 bg-accent text-accent-foreground rounded-sm p-1">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-background/85 backdrop-blur-sm text-label text-foreground text-center py-1 leading-tight">
                        {f.nameHe}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-label text-muted-foreground mt-5 leading-relaxed">
                * הצבעים על המסך הם קירוב חזותי. הגוון, המרקם והמשקל הסופיים
                נקבעים מול המניפה הפיזית, נשמח להביא אליכם אותה בפגישה.
              </p>
            </div>
          </div>
        </section>
      </main>

      <ConversionCTA
        title="מצאתם את הבד. עכשיו נביא לכם את המניפה."
        subtitle="נשלח אליכם דגימות פיזיות ונרכיב הצעה סגורה, כדי שתראו ותרגישו לפני שמחליטים."
        whatsappMessage="היי, בחרתי בד בסטודיו של אלומה ואשמח לקבל דגימות והצעת מחיר."
      />

      <Footer />
    </div>
  );
};

export default FabricConfigurator;
