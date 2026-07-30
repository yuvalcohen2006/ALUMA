import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ShineButton from "@/components/ui/shine-button";
import alumaLogo from "@/assets/aluma-logo.png";
import storyPortrait from "@/assets/story-portrait.png";
import storyPortraitRoy from "@/assets/story-portrait-roy.png";
import storyPortraitIdan from "@/assets/story-portrait-idan.png";
// The kinetic אור — see the file for why the span is Heebo, not Assistant.
import "@/components/story/kinetic-or.css";

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "דף הבית", item: "https://alumaoutdoor.com/" },
    { "@type": "ListItem", position: 2, name: "הסיפור שלנו", item: "https://alumaoutdoor.com/story" },
  ],
};

/**
 * The three words the story keeps circling back to, set in the Projects folio
 * grammar — numeral, rule, word, one line. Each line is the story paragraph
 * above it, folded down to a sentence.
 */
const values = [
  {
    n: "01",
    word: "חומר",
    line: "אלומיניום חזק, נקי ועמיד, שנועד לחיות בחוץ בלי לחשוש מהשמש, מהגשם או ממעבר הזמן.",
  },
  {
    n: "02",
    word: "אור",
    line: "האור שנמצא בצליל של השם שלנו הוא גם מה שמגדיר את חוויית החוץ שאנחנו מעצבים.",
  },
  {
    n: "03",
    word: "בית",
    line: "כל מערכת שאנחנו יוצרים היא הדרך שבה הבית ממשיך החוצה, סלון תחת כיפת השמיים.",
  },
];

const StoryPage = () => {
  return (
    <Layout>
      <SEO
        title="הסיפור שלנו | Aluma, ריהוט חוץ בעיצוב אישי"
        description="Aluma נולדה מתוך חיבור בין חומר לאור. סיפור המותג, הערכים והגישה לעיצוב סלוני חוץ יוקרתיים בייצור אישי לתנאי החוץ של ישראל."
        path="/story"
        jsonLd={breadcrumbs}
      />

      <PageHero title="הסיפור שלנו" />

      {/* ── 1. The story — paragraph on the right (RTL first), the family on
             the left. Plain section rhythm: the columns centre against each
             other and the padding does the rest, no viewport math and no
             optical nudges. ── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-luxury">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center max-w-7xl mx-auto">
            <Reveal className="min-w-0">
              <div className="space-y-3.5 text-foreground text-body text-right max-w-md mx-auto">
                {/* THE SIGNATURE: אור thickens 300→900 as it scrolls through
                    the viewport (kinetic-or.css). The copy itself is untouched
                    — the span only cuts the word out of "לאור". */}
                <p>
                  אלומה נולדה מתוך חיבור בין חומר ל<span className="kinetic-or">אור</span>.
                </p>

                <p>
                  השם מגיע מהשורש של אלומיניום, חומר חזק, נקי ועמיד, כזה שנועד
                  לחיות בחוץ בלי לחשוש מהשמש, מהגשם או ממעבר הזמן. ומעבר לחומר,
                  יש בו גם צליל של אור, אותו אור שמגדיר את חוויית החוץ.
                </p>

                <p>אלומה היא לא רק ריהוט חוץ, היא הדרך שבה הבית ממשיך החוצה.</p>

                <p>
                  אנחנו יוצרים מערכות שמרגישות כמו סלון יוקרתי תחת כיפת השמיים —
                  מקום לארח, להירגע ולחיות את הרגעים היפים באמת. כל פריט מיוצר
                  בהתאמה אישית, בקווים נקיים ומדויקים, עם שלדת אלומיניום מתקדמת
                  ובדים איכותיים העומדים בתנאי החוץ של ישראל.
                </p>

                <p>
                  את אולם התצוגה שלנו תוכלו למצוא ביציץ, ואנחנו מזמינים
                  אתכם להגיע, להתרשם מקרוב ולקבל יחס אישי וחם. נשמח לארח כל מי
                  שיגיע ולתת לו לחוות את אלומה כמו שהיא באמת.
                </p>

                <p className="text-foreground tracking-wide pt-1">
                  זו לא רק חוויה, זו איכות חיים.
                </p>
              </div>
            </Reveal>

            {/* Left column: the logo above the portrait trio. */}
            <Reveal delay={140} className="min-w-0">
              <div className="flex flex-col items-center">
                <div className="flex justify-center mb-12 md:mb-[60px]">
                  <img
                    src={alumaLogo}
                    alt="Aluma"
                    className="h-[58px] md:h-[77px] w-auto opacity-90"
                  />
                </div>
                {/* One gradient, 10px deep, along the bottom edge only — which
                    is exactly the two lower corners and the line between them.
                    Nothing here crops the drawings themselves. */}
                <div
                  className="flex items-end justify-center gap-[26px] w-full max-w-[813px] mx-auto"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, #000 calc(100% - 10px), transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, #000 calc(100% - 10px), transparent 100%)",
                  }}
                >
                  {[
                    { src: storyPortraitIdan, alt: "דיוקן קווי, עידן", name: "idan" },
                    { src: storyPortraitRoy, alt: "דיוקן קווי, רועי", name: "roy" },
                    { src: storyPortrait, alt: "דיוקן קווי, בן", name: "ben" },
                  ].map((p) => (
                    <img
                      key={p.name}
                      src={p.src}
                      alt={p.alt}
                      loading="lazy"
                      className="w-1/3 aspect-square object-contain object-bottom mix-blend-multiply"
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 2. The values strip — the story folded down to its three words,
             threaded on the same numeral-and-rule device the Projects index
             runs on. The hairline above it is the seam between two warm-white
             sections. ── */}
      <section className="pb-16 md:pb-24 bg-background">
        <div className="container-luxury">
          <div className="h-px bg-border max-w-7xl mx-auto" aria-hidden="true" />

          <div className="mt-12 md:mt-16 grid gap-12 md:grid-cols-3 md:gap-10 lg:gap-14 max-w-7xl mx-auto">
            {values.map((v, i) => (
              // Delay cascades from the right — index 0 is the rightmost child
              // in RTL — so the reveal runs in reading order.
              <Reveal key={v.n} delay={i * 110} className="min-w-0 text-right">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="font-display text-[46px] lg:text-[58px] leading-none tabular-nums text-primary/70"
                  >
                    {v.n}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-primary/25" />
                </div>
                <h2 className="font-display font-normal text-card-title text-foreground mt-5">
                  {v.word}
                </h2>
                <p className="mt-3 text-meta text-muted-foreground text-pretty">{v.line}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Close — the page's one charcoal band. ── */}
      <section className="relative grain py-20 md:py-28 bg-foreground">
        <div className="container-luxury">
          <Reveal className="flex flex-col items-center text-center">
            <SectionHeading
              light
              subtitle="את הסיפור קראתם, עכשיו בואו לשבת עליו: כל המערכות פרוסות באולם התצוגה, ואנחנו נשמח לארח אתכם."
            >
              בואו לבקר ביציץ
            </SectionHeading>
            <div className="mt-9">
              <ShineButton to="/contact" invert>
                לתיאום ביקור
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </ShineButton>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default StoryPage;
