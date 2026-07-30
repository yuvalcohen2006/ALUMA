import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Blocks, ClipboardList, Palette, ScanLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import { cn } from "@/lib/utils";
import { SOFA_UNITS } from "@/data/sofaUnits";
import { sunbrellaFabrics } from "@/data/sunbrella";

/**
 * DIY hub — "the workbench".
 *
 * Not a card grid: two long bench planks with two shorter stations clamped
 * between them (wide / two-up / wide). Each plank is stamped with its bench
 * number and carries a framed *specimen* of the tool it opens — the actual
 * modular units with their real names, the actual Sunbrella swatches, a drawn
 * floor plane with the AR reticle, the actual questionnaire steps as a rail —
 * instead of a stock photo. A cursor-tracked lamp warms whichever plank you
 * point at.
 *
 * Heights are left to the content on purpose: the two wide planks size
 * themselves and the two short ones share a row, so no plank can end up with a
 * void in the middle of it.
 *
 * Everything closes on one charcoal band — the single dark section on the page.
 */

const SITE = "https://alumaoutdoor.com";

/** Eight swatches spread across all three Sunbrella families. */
const swatchSample = sunbrellaFabrics.filter((_, i) => i % 2 === 0).slice(0, 8);
const swatchRest = sunbrellaFabrics.length - swatchSample.length;

/** The four steps the questionnaire actually walks you through. */
const questionnaireSteps = ["המרחב", "סגנון ולוח זמנים", "מה לכלול", "פרטי קשר"];

const introFacts = [
  "בלי הרשמה, בלי עלות",
  "הכול רץ מהדפדפן",
  "התוצאה מגיעה אלינו בלחיצה",
];

const closingFacts = ["בלי עלות", "בלי התחייבות", "מענה תוך 24 שעות"];

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "דף הבית", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "עשה זאת בעצמך", item: `${SITE}/diy` },
  ],
};

const toolList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "כלים לתכנון עצמי של ריהוט חוץ",
  inLanguage: "he-IL",
  itemListElement: [
    { name: "עצבו סלון", url: `${SITE}/designer` },
    { name: "בחרו את הבד", url: `${SITE}/fabric` },
    { name: "AR, תצוגה במרחב", url: `${SITE}/ar` },
    { name: "שאלון חכם", url: `${SITE}/questionnaire` },
  ].map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    url: t.url,
  })),
};

/**
 * A lamp that follows the cursor across the plank. Written straight onto the
 * element as custom properties so pointing at a station never re-renders React.
 */
const trackLamp = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--lamp-x", `${e.clientX - r.left}px`);
  el.style.setProperty("--lamp-y", `${e.clientY - r.top}px`);
};

interface StationProps {
  /** Stamped bench number, e.g. "01". */
  n: string;
  /** Where the whole plank leads. */
  to: string;
  /** Grid placement — the bench layout lives here, not inside the component. */
  className?: string;
  children: ReactNode;
}

/**
 * Shared plank chrome: warm border, lift on hover, the cursor lamp and the
 * stamped number. The transparent overlay link makes the whole plank clickable
 * for the mouse; keyboard and screen readers get the ShineButton inside, which
 * is why the overlay is taken out of the accessibility tree entirely — and why
 * the plank answers to focus-within as well as hover, so tabbing to a station's
 * button lights the same plank a mouse would.
 *
 * Nothing painted above the stamp is opaque (the specimen plates are
 * bg-secondary/50, the button is a 5% wash), so the numeral reads through
 * whatever lands on top of it.
 */
const Station = ({ n, to, className, children }: StationProps) => (
  <li
    onMouseMove={trackLamp}
    className={cn(
      "group relative overflow-hidden rounded-[14px] border border-border bg-background p-6 sm:p-8 md:p-9 shadow-soft",
      "transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-luxury",
      "focus-within:-translate-y-1 focus-within:border-primary/60 focus-within:shadow-luxury",
      className,
    )}
  >
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        background:
          "radial-gradient(260px circle at var(--lamp-x, 50%) var(--lamp-y, 0%), hsl(var(--primary) / 0.12), transparent 72%)",
      }}
    />

    {/* Stamped station number, tucked into the far (left, in RTL) corner. */}
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-3 end-4 sm:end-6 select-none font-display text-[80px] sm:text-[96px] leading-none text-primary/[0.13] transition-colors duration-300 group-hover:text-primary/25"
    >
      {n}
    </span>

    <Link
      to={to}
      tabIndex={-1}
      aria-hidden="true"
      className="absolute inset-0 z-[1] rounded-[14px]"
    />

    {/* Content floats above the overlay but stays click-through, so a click
        anywhere on the plank still opens the tool. The CTA takes its clicks
        back explicitly. */}
    <div className="pointer-events-none relative z-[2] flex h-full flex-col text-right">
      {children}
    </div>
  </li>
);

/** Icon plate, name and the hairline that stretches when the plank wakes up. */
const StationHead = ({ icon: Icon, title }: { icon: LucideIcon; title: string }) => (
  <>
    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] border border-border bg-secondary text-primary transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/10 group-focus-within:border-primary/50 group-focus-within:bg-primary/10">
      <Icon className="h-7 w-7" strokeWidth={1.6} aria-hidden="true" />
    </span>
    <h3 className="mt-6 font-display font-normal text-card-title leading-snug text-foreground">
      {title}
    </h3>
    <span
      aria-hidden="true"
      className="mt-4 block h-[2px] w-14 bg-primary/50 transition-all duration-300 group-hover:w-24 group-focus-within:w-24"
    />
  </>
);

/**
 * The framed specimen a plank carries: a real fragment of the tool it opens,
 * on one shared plate so the stations read as one bench rather than unrelated
 * tiles. Station 04 is the exception — its specimen is the step rail, which
 * runs the plank's full width instead of sitting inside a plate.
 */
const Specimen = ({
  caption,
  className,
  children,
}: {
  caption: string;
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "rounded-[10px] border border-border bg-secondary/50 p-4 transition-colors duration-300 group-hover:border-primary/40 group-focus-within:border-primary/40",
      className,
    )}
  >
    {children}
    <p className="mt-3 text-meta leading-relaxed text-muted-foreground">{caption}</p>
  </div>
);

const StationCta = ({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) => (
  <div className={cn("pointer-events-auto", className)}>
    <ShineButton to={to}>
      {children}
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    </ShineButton>
  </div>
);

const DIYPage = () => {
  return (
    <Layout>
      <SEO
        title="עשה זאת בעצמך | כלים לתכנון סלון החוץ שלכם | Aluma"
        description="ארבעה כלים לתכנון ריהוט החוץ שלכם: מעצב סלון מודולרי, בחירת בד Sunbrella עם תצוגה מיידית, תצוגת AR בגודל אמיתי במרפסת ושאלון חכם להמלצה אישית. הכול מהדפדפן, בלי הרשמה."
        path="/diy"
        jsonLd={[breadcrumbs, toolList]}
      />

      <PageHero title="עשה זאת בעצמך" />

      {/* ===== Intro: what this page is for ===== */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container-luxury">
          <Reveal>
            {/* mx-auto, same as the two sections below it — without it this block
                hugs the right edge in RTL and its left edge misses theirs. */}
            <div className="mx-auto grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 items-start max-w-6xl">
              <SectionHeading
                align="start"
                subtitle="ריכזנו במקום אחד את הכלים שמאפשרים לכם להתחיל לתכנן עוד לפני שדיברנו איתנו. אפשר להרכיב מערכת ישיבה מודולרית לפי המידות שלכם, לבחור גוון בד ולראות אותו מיד על הספה, להציב רהיט בגודל אמיתי במרפסת דרך מצלמת הטלפון, או פשוט לענות על כמה שאלות ולקבל המלצה. כל כלי עומד בפני עצמו, ואפשר להתחיל מאיפה שנוח לכם."
              >
                מה אפשר לעשות כאן
              </SectionHeading>

              <ul className="space-y-4 lg:border-s lg:border-border lg:ps-10">
                {introFacts.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-meta text-foreground">
                    <span className="h-px w-6 shrink-0 bg-primary/60" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== The bench: two long planks with two stations clamped between ===== */}
      <section className="py-20 md:py-28 bg-secondary">
        <div className="container-luxury">
          <Reveal className="mb-12 md:mb-16 flex flex-col items-center">
            <SectionHeading
              tone="charcoal"
              subtitle="אין כאן סדר נכון. אפשר להתחיל מהתחנה שהכי מדברת אליכם ולחזור לשאר מתי שתרצו, כל אחת מהן עומדת בפני עצמה."
            >
              ארבע תחנות עבודה
            </SectionHeading>
          </Reveal>

          <Reveal>
            {/* A real list, so a screen reader gets "4 items" and the grouping the
                stamped 01–04 gives everyone else. The numerals themselves stay
                aria-hidden — the heading says there is no right order, so an <ol>
                would claim something untrue. Auto-placement handles the layout:
                the wide planks span both columns, the two short ones share the
                middle row, so each plank is only ever as tall as its own content.
                The bench opens at lg — below that two columns would leave a plank
                too narrow for a 20px paragraph. */}
            <ul
              role="list"
              className="mx-auto grid max-w-6xl gap-6 lg:gap-8 lg:grid-cols-2"
            >
              {/* ---- 01 · the long plank at the head of the bench ---- */}
              <Station n="01" to="/designer" className="lg:col-span-2">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
                  <div className="lg:w-[40%] lg:shrink-0">
                    <StationHead icon={Blocks} title="עצבו סלון" />

                    <p className="mt-5 text-lede leading-relaxed text-foreground text-pretty">
                      הרכיבו את מערכת הישיבה שלכם יחידה אחר יחידה: פינות, יחידות
                      אמצע והדומים. גררו כדי לשנות את הסדר, הוסיפו והורידו יחידות,
                      והאורך הכולל מתעדכן מולכם בזמן אמת.
                    </p>

                    <p className="mt-6 text-meta leading-relaxed text-muted-foreground">
                      בסוף: הקומפוזיציה והאורך הכולל נשלחים אלינו בוואטסאפ, ואנחנו
                      חוזרים אליכם עם הצעת מחיר.
                    </p>

                    <StationCta to="/designer" className="mt-8">
                      פתחו את המעצב
                    </StationCta>
                  </div>

                  {/* The kit itself, named the way the tool names it. */}
                  {/* Four columns only from lg, where the plank is wide enough
                      that a real unit name still fits on one line. */}
                  <Specimen caption="כל יחידה במידות 1×1 מ׳" className="lg:flex-1">
                    <ul role="list" className="grid grid-cols-2 lg:grid-cols-4 items-end gap-4">
                      {SOFA_UNITS.map((u, i) => (
                        // Wrapper carries the lift so the mirrored units keep
                        // their own scaleX transform on the image itself.
                        <li
                          key={u.id}
                          className="transition-transform duration-300 ease-out group-hover:-translate-y-1"
                          style={{ transitionDelay: `${i * 45}ms` }}
                        >
                          <img
                            src={u.image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            width={1024}
                            height={1024}
                            className="h-auto w-full object-contain"
                            style={{ transform: u.mirrored ? "scaleX(-1)" : undefined }}
                          />
                          <span className="mt-1 block text-center text-meta text-muted-foreground">
                            {u.nameHe}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Specimen>
                </div>
              </Station>

              {/* ---- 02 · short station, right column in RTL ---- */}
              <Station n="02" to="/fabric">
                <StationHead icon={Palette} title="בחרו את הבד" />

                <p className="mt-5 text-lede leading-relaxed text-foreground text-pretty">
                  עברו על מניפת Sunbrella המקורית, לחצו על גוון, וראו מיד איך הספה
                  נראית איתו.
                </p>

                {/* Real swatches from the configurator, waking one after another. */}
                <Specimen
                  caption={`ועוד ${swatchRest} גוונים במניפה, מ־Canvas לצבעי בסיס, דרך Heritage למרקמים ועד Patterns לדוגמאות ופסים.`}
                  className="mt-6"
                >
                  {/* A fixed 4×2 block rather than a loose row: at the plank's
                      width a wrapping flex row leaves an orphan swatch on the
                      second line at some breakpoints, the grid never does. */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {swatchSample.map((f, i) => (
                      <span
                        key={f.code}
                        aria-hidden="true"
                        className="h-12 rounded-[10px] border border-border transition-transform duration-300 ease-out group-hover:-translate-y-1"
                        style={{ background: f.background, transitionDelay: `${i * 40}ms` }}
                      />
                    ))}
                  </div>
                </Specimen>

                <StationCta to="/fabric" className="mt-8 lg:mt-auto lg:pt-8">
                  לבחירת הבד
                </StationCta>
              </Station>

              {/* ---- 03 · short station, left column in RTL ---- */}
              <Station n="03" to="/ar">
                <StationHead icon={ScanLine} title="AR, תצוגה במרחב" />

                <p className="mt-5 text-lede leading-relaxed text-foreground text-pretty">
                  בחרו פריט, כוונו את מצלמת הטלפון לרצפה, והרהיט יופיע לפניכם בגודל
                  אמיתי, כדי לבדוק שהמידות עובדות עוד לפני שמזמינים.
                </p>

                {/* Drawn, not photographed: the floor plane the phone finds, with
                    the placement reticle settling onto it as the plank wakes. */}
                <Specimen
                  caption="רץ מהדפדפן בטלפון, בלי אפליקציה. עובד על iPhone מגרסת iOS 12 ומעלה ועל מכשירי אנדרואיד עם תמיכת ARCore."
                  className="mt-6"
                >
                  <div className="relative h-[76px] overflow-hidden rounded-[10px] bg-background/70 [perspective:420px]">
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-[-30%] bottom-0 h-32 origin-bottom opacity-70 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100 [transform:rotateX(64deg)]"
                      style={{
                        backgroundImage:
                          "linear-gradient(hsl(var(--primary) / 0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.35) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        maskImage: "linear-gradient(to top, #000 30%, transparent 88%)",
                        WebkitMaskImage: "linear-gradient(to top, #000 30%, transparent 88%)",
                      }}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-[58%] h-12 w-12 rounded-full border-2 border-primary/55 transition-transform duration-500 ease-out [transform:translate(-50%,-50%)_rotateX(64deg)_scale(1.3)] group-hover:[transform:translate(-50%,-50%)_rotateX(64deg)_scale(1)] group-focus-within:[transform:translate(-50%,-50%)_rotateX(64deg)_scale(1)]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-[58%] h-1.5 w-1.5 rounded-full bg-primary/70 [transform:translate(-50%,-50%)]"
                    />
                  </div>
                </Specimen>

                <StationCta to="/ar" className="mt-8 lg:mt-auto lg:pt-8">
                  פתחו את התצוגה
                </StationCta>
              </Station>

              {/* ---- 04 · the long plank that closes the bench ---- */}
              <Station n="04" to="/questionnaire" className="lg:col-span-2">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
                  <div className="lg:flex-1">
                    <StationHead icon={ClipboardList} title="שאלון חכם" />
                    <p className="mt-5 max-w-2xl text-lede leading-relaxed text-foreground text-pretty">
                      ארבעה שלבים קצרים על המרחב, על הסגנון ועל לוח הזמנים שלכם.
                      בסוף תקבלו המלצה על הקולקציה שמתאימה לכם ביותר, ואנחנו נחזור
                      אליכם לתאם פגישת אפיון ללא עלות.
                    </p>
                  </div>

                  <StationCta to="/questionnaire" className="shrink-0">
                    התחילו בשאלון
                  </StationCta>
                </div>

                {/* The one thing only this plank is wide enough to do: the four
                    real steps stretched end to end, like a track along the bench.
                    The connectors take the slack, so the rail always reaches both
                    edges however long the labels are. It only goes single-line at
                    lg, where the plank spans both columns — narrower than that the
                    four chips cannot fit a row and would be clipped by the plank's
                    overflow-hidden, so they wrap instead. */}
                <ol className="mt-9 flex flex-wrap items-center gap-3 lg:flex-nowrap">
                  {questionnaireSteps.map((s, i) => (
                    <li
                      key={s}
                      className="flex items-center gap-3 lg:flex-1 lg:last:flex-none"
                    >
                      <span
                        className="whitespace-nowrap rounded-[10px] border border-border bg-secondary/60 px-4 py-2 text-meta text-foreground transition-colors duration-300 group-hover:border-primary/40 group-focus-within:border-primary/40"
                        style={{ transitionDelay: `${i * 45}ms` }}
                      >
                        {s}
                      </span>
                      {i < questionnaireSteps.length - 1 && (
                        <span
                          className="h-px w-5 shrink-0 lg:w-auto lg:flex-1 bg-primary/45"
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </Station>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ===== The one dark band: where everything you built ends up ===== */}
      <section className="py-20 md:py-28 bg-foreground">
        <div className="container-luxury">
          <Reveal>
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1.55fr)_auto_minmax(0,1fr)] lg:gap-14">
              <div className="text-right">
                <h2 className="font-display font-bold text-subsection leading-snug text-background">
                  מה שיוצא מכאן מגיע ישירות אלינו
                </h2>
                <div className="w-20 h-[2px] bg-background/40 mt-5" aria-hidden="true" />
                <p className="mt-6 text-lede leading-relaxed text-background/75 text-pretty">
                  הקומפוזיציה שהרכבתם, הגוון שבחרתם או התשובות שמילאתם מגיעים אלינו
                  בדיוק כפי שהם. משם אנחנו לוקחים את זה הלאה: בודקים מידות, מתאימים
                  חומרים ובדים, וחוזרים אליכם עם הצעה מדויקת למרחב שלכם. ואם נוח
                  לכם פשוט לדבר לפני שמתחילים, גם זו התחלה טובה.
                </p>
              </div>

              <div className="hidden lg:block w-px self-stretch bg-background/15" aria-hidden="true" />

              <div className="flex flex-col items-start gap-7">
                <ul className="space-y-3">
                  {closingFacts.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-meta text-background/80">
                      <span className="h-px w-6 shrink-0 bg-primary/70" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>

                <ShineButton to="/contact" invert>
                  דברו איתנו
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </ShineButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default DIYPage;
