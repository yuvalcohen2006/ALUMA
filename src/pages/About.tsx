import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import SectionRule from "@/components/SectionRule";
import TeamPortraits from "@/components/about/TeamPortraits";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { SITE } from "@/config/site";
import heroPhoto from "@/assets/collections/salon-marina.jpg";
import chapterOne from "@/assets/collections/salon-eucalyptus.jpg";
import chapterTwo from "@/assets/collections/salon-monolith.jpg";
import chapterThree from "@/assets/collections/table-granite.jpg";
import sunbrellaImg from "@/assets/materials/sunbrella.jpg";
import aluminumImg from "@/assets/materials/aluminum.jpg";
import graniteImg from "@/assets/materials/granite.jpg";

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "דף הבית", item: "https://alumaoutdoor.com/" },
    { "@type": "ListItem", position: 2, name: "אודות", item: "https://alumaoutdoor.com/about" },
  ],
};

/**
 * Three numbers, or none.
 *
 * Deliberately empty: nobody has supplied the real figures, and inventing
 * "500 משפחות" on an about page is the same category of lie as the fabricated
 * reviews. The band renders only once these are filled in — see the owner
 * checklist in docs/GUIDE.md. Three is the cap; more reads as filler.
 */
const PROOF: { value: string; label: string }[] = [];

const chapters = [
  {
    label: "השם",
    title: "חומר ואור",
    img: chapterOne,
    body: "השם מגיע מהשורש של אלומיניום — חומר חזק, נקי ועמיד, כזה שנועד לחיות בחוץ בלי לחשוש מהשמש, מהגשם או ממעבר הזמן. ומעבר לחומר, יש בו גם צליל של אור, אותו אור שמגדיר את חוויית החוץ.",
  },
  {
    label: "הגישה",
    title: "הבית ממשיך החוצה",
    img: chapterTwo,
    body: "אלומה היא לא רק ריהוט חוץ, היא הדרך שבה הבית ממשיך החוצה. אנחנו יוצרים מערכות שמרגישות כמו סלון יוקרתי תחת כיפת השמיים — מקום לארח, להירגע ולחיות את הרגעים היפים באמת.",
  },
  {
    label: "הייצור",
    title: "כל פריט, בהתאמה אישית",
    img: chapterThree,
    body: "כל פריט מיוצר בהתאמה אישית, בקווים נקיים ומדויקים, עם שלדת אלומיניום מתקדמת ובדים איכותיים העומדים בתנאי החוץ של ישראל.",
  },
];

/**
 * Each of these is a restatement of something the brand already says about
 * itself on the old Our Story page — not a new claim. Anything asserting how
 * the business operates (lead times, team continuity, how many people it
 * serves) has to come from the owner before it goes on the page.
 */
const values = [
  {
    title: "חומרים שנבנו לחוץ",
    body: "שלדת אלומיניום מתקדמת, בדים איכותיים ושיש גרניט פורצלן — חומרים שנועדו לעמוד בתנאי החוץ של ישראל.",
  },
  {
    title: "בהתאמה אישית",
    body: "כל פריט מיוצר בהתאמה אישית, בקווים נקיים ומדויקים, לפי המרחב שהוא נכנס אליו.",
  },
  {
    title: "יחס אישי וחם",
    body: "אנחנו מזמינים אתכם לאולם התצוגה, ונשמח לארח כל מי שיגיע ולתת לו לחוות את אלומה כמו שהיא באמת.",
  },
];

const craft = [
  { slug: "sunbrella", label: "בדי Sunbrella", img: sunbrellaImg },
  { slug: "aluminum", label: "אלומיניום", img: aluminumImg },
  { slug: "granite-porcelain", label: "שיש גרניט פורצלן", img: graniteImg },
];

const AboutPage = () => {
  const { to } = useLocalizedPath();

  return (
    <Layout>
      <SEO
        title="אודות | Aluma, ריהוט חוץ בעיצוב אישי"
        description="אלומה נולדה מתוך חיבור בין חומר לאור. הסיפור, הערכים והגישה לעיצוב סלוני חוץ יוקרתיים בייצור אישי לתנאי החוץ של ישראל."
        path="/about"
        jsonLd={breadcrumbs}
      />

      {/* 1 — HERO STATEMENT. A photograph and one line. Deliberately not the
          team portrait: that lands later, once there's a reason to care who
          made this. */}
      <section className="relative min-h-[70vh] flex items-end">
        <img
          src={heroPhoto}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.20) 45%, rgba(0,0,0,0.05) 100%)",
          }}
        />
        <div className="container-luxury relative pb-16 md:pb-24 pt-40">
          <h1 className="font-display text-background text-[clamp(32px,5vw,56px)] leading-[1.12] max-w-[16ch] text-balance">
            אלומה נולדה מתוך חיבור בין חומר לאור.
          </h1>
        </div>
      </section>

      {/* 2 — THE LETTER. The highest-trust element on an about page, so it
          comes second, not last.

          ⚠️ This is currently the brand's OWN existing words, reformatted —
          nothing here is invented. It is also shorter than it wants to be:
          the research target is 120–180 words about why the business exists
          and what it refuses to compromise on, and only the owner can write
          that. Asking for it is a checklist item in docs/GUIDE.md. When it
          arrives, replace the paragraphs below and keep the signature. */}
      <section className="section-pad bg-secondary">
        <div className="container-luxury">
          <Reveal>
            <div className="mx-auto max-w-[60ch] text-right">
              <p className="text-[13px] uppercase tracking-[0.08em] text-foreground/55">
                כמה מילים מאיתנו
              </p>
              <SectionRule on="tinted" variant="accent" align="start" />
              <div className="space-y-5 text-[19px] md:text-[21px] leading-[1.7] text-foreground text-pretty">
                <p>
                  אנחנו יוצרים מערכות שמרגישות כמו סלון יוקרתי תחת כיפת השמיים —
                  מקום לארח, להירגע ולחיות את הרגעים היפים באמת.
                </p>
                <p>
                  את אולם התצוגה שלנו תוכלו למצוא ב{SITE.address.city}, ואנחנו
                  מזמינים אתכם להגיע, להתרשם מקרוב ולקבל יחס אישי וחם. נשמח לארח
                  כל מי שיגיע ולתת לו לחוות את אלומה כמו שהיא באמת.
                </p>
                <p className="tracking-wide">זו לא רק חוויה, זו איכות חיים.</p>
              </div>
              <p className="mt-8 text-[15px] text-foreground/70">— עידן, רועי ובן</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 — THE STORY, as alternating splits. These ARE the timeline; a
          literal timeline component is a mobile liability and adds nothing. */}
      <section className="section-pad bg-background">
        <div className="container-luxury space-y-20 md:space-y-24">
          {chapters.map((c, i) => (
            <Reveal key={c.label}>
              <article className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <img
                    src={c.img}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="w-full aspect-[4/5] object-cover rounded-[14px]"
                  />
                </div>
                <div className={`text-right ${i % 2 === 1 ? "md:order-1" : ""}`}>
                  <p className="text-[13px] uppercase tracking-[0.08em] text-foreground/55">
                    {c.label}
                  </p>
                  <h2 className="mt-3 font-display font-bold text-[28px] md:text-[34px] leading-tight text-primary">
                    {c.title}
                  </h2>
                  <SectionRule on="light" variant="accent" align="start" />
                  <p className="max-w-[46ch] text-[18px] leading-relaxed text-foreground-soft text-pretty">
                    {c.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4 — WHAT WE STAND FOR. Numbered, no icons: a row of six icons is the
          single clearest tell of a template about page. */}
      <section className="section-pad bg-secondary">
        <div className="container-luxury">
          <Reveal>
            <h2 className="font-display font-bold text-[28px] md:text-[34px] text-foreground text-right">
              מה חשוב לנו
            </h2>
            <SectionRule on="tinted" variant="hairline" />
          </Reveal>
          <ul className="grid gap-10 md:grid-cols-3 md:gap-12">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <li className="text-right">
                  <span className="block text-[13px] tabular-nums text-foreground/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-[21px] leading-snug text-foreground">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-[17px] leading-relaxed text-foreground-soft text-pretty">
                    {v.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 5 — CRAFT TEASER. Ties the page into real content instead of
          dead-ending on a CTA. */}
      <section className="section-pad bg-background">
        <div className="container-luxury">
          <Reveal>
            <h2 className="font-display font-bold text-[28px] md:text-[34px] text-primary text-right">
              החומרים שאנחנו עובדים איתם
            </h2>
            <SectionRule on="light" variant="hairline" />
          </Reveal>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
            {craft.map((m, i) => (
              <Reveal key={m.slug} delay={i * 80}>
                <li>
                  <Link to={to(`/materials/${m.slug}`)} className="group block">
                    <img
                      src={m.img}
                      alt={m.label}
                      loading="lazy"
                      className="w-full aspect-square object-cover rounded-[14px] transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <h3 className="mt-3 text-[18px] text-foreground text-right decoration-1 underline-offset-4 group-hover:underline">
                      {m.label}
                    </h3>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 6 — THE PEOPLE. The preserved wordmark + portraits, on a light surface
          because mix-blend-multiply needs one. */}
      <section className="section-pad bg-secondary">
        <div className="container-luxury">
          <Reveal>
            <TeamPortraits />
          </Reveal>
        </div>
      </section>

      {/* 7 — PROOF. Renders only when the real figures exist. */}
      {PROOF.length > 0 && (
        <section className="section-pad bg-background">
          <div className="container-luxury">
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
              {PROOF.map((p) => (
                <li key={p.label}>
                  <div className="font-display text-[44px] leading-none text-primary tabular-nums">
                    {p.value}
                  </div>
                  <div className="mt-3 text-[13px] uppercase tracking-[0.08em] text-foreground/60">
                    {p.label}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 8 — CTA. Two doors: come see it, or go look at it. */}
      <section className="bg-foreground text-background">
        <div className="container-luxury py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 text-right">
            <div>
              <h2 className="font-display text-[28px] md:text-[34px] leading-tight">
                בואו לראות מקרוב
              </h2>
              <p className="mt-3 text-[18px] leading-relaxed text-background/75">
                אולם התצוגה שלנו ב{SITE.address.full}. קפצו לבקר — או דברו איתנו קודם.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <Link to={to("/contact")} className="btn-shine inline-flex items-center gap-2">
                לתיאום ביקור
                <ArrowLeft className="w-4 h-4 ltr:-scale-x-100" aria-hidden="true" />
              </Link>
              <Link
                to={to("/collections")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] border border-background/35 text-background hover:bg-background/10 transition-smooth"
              >
                לקולקציות
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
