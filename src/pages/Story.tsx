import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { Link } from "react-router-dom";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { useSiteContact } from "@/hooks/useSiteContact";
import alumaLogo from "@/assets/aluma-logo.png";
import craftDetail from "@/assets/about/craft-detail.jpg";
import terraceDusk from "@/assets/about/terrace-dusk.jpg";
import storyPortrait from "@/assets/story-portrait.png";
import storyPortraitRoy from "@/assets/story-portrait-roy.png";
import storyPortraitIdan from "@/assets/story-portrait-idan.png";

const breadcrumbs = {
"@context": "https://schema.org",
"@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "דף הבית", item: "https://alumaoutdoor.com/" },
    { "@type": "ListItem", position: 2, name: "אודות", item: "https://alumaoutdoor.com/story" },
  ],
};

/** The three of us, described by what we do rather than by a job title. */
const people = [
  { src: storyPortraitIdan, alt: "דיוקן קווי, עידן", name: "עידן", does: "מתכנן ומודד את המרחב" },
  { src: storyPortraitRoy, alt: "דיוקן קווי, רועי", name: "רועי", does: "בוחר את החומרים" },
  { src: storyPortrait, alt: "דיוקן קווי, בן", name: "בן", does: "מלווה מהסקיצה ועד ההתקנה" },
];

/**
 * What we don't do — the single highest-value device for a brand with no
 * numbers to quote. Refusals cost nothing, are verifiable, and can't be faked;
 * Vitsœ built its whole identity on this. Every line restates a commitment the
 * brand already makes elsewhere on the site, phrased as what it rules out.
 */
const refusals = [
"לא מוכרים ריהוט שלא היינו שמים בחצר שלנו.",
"לא עובדים במידות סטנדרטיות. כל פריט נמדד למרחב שלו.",
"לא מבטיחים תאריך אספקה לפני שיש לנו אותו.",
"לא נעלמים אחרי ההתקנה.",
];

/**
 * אודות.
 *
 * Built on what premium furniture houses actually do — Vitsœ, DEDON, Minotti,
 * Tribù — rather than on the template every other brand ships. Three decisions
 * carry it:
 *
 *   1. NO hero photograph. The most premium page of that set (Vitsœ) opens on
 *      type alone, and this site's home page is already a wall of full-bleed
 *      photography — repeating that here would make About read as a second
 *      home page. The opening statement has a refusal in it, which is what
 *      separates a position from a platitude.
 *   2. Three photographs total, not seven. The observed range across those
 *      houses is 3–7, and the restrained end is where the expensive ones sit.
 *   3. Where numbers would go, refusals go instead. There is no founding year
 *      worth boasting about and no client count, and a thin stat strip reads
 *      as padding. What we don't do is free to state and impossible to fake.
 *
 * The preserved elements — the brand paragraphs, the wordmark, the three line
 * portraits — are all still here, placed where the research says they belong:
 * the wordmark bookends the page (small at the top, large and faint at the
 * close), the paragraphs are the story, and the portraits sit between the
 * story and the refusals.
 */
const StoryPage = () => {
  // Live contact facts, falling back to src/config/site.ts.
  const SITE = useSiteContact();
  const { to } = useLocalizedPath();

  return (
    <Layout>
      <SEO
        title="אודות | Aluma, ריהוט חוץ בעיצוב אישי"
        description="אלומה נולדה מתוך חיבור בין חומר לאור. מי אנחנו, איך אנחנו עובדים, ומה אנחנו לא עושים."
        path="/story"
        jsonLd={breadcrumbs}
      />

      {/* 1 — THE STATEMENT. Type only. */}
      <section className="bg-background">
        <div className="mx-auto max-w-[860px] px-6 pt-40 pb-20 md:pt-52 md:pb-28">
          <Reveal>
            <img
              src={alumaLogo}
              alt="Aluma"
              className="h-6 md:h-7 w-auto opacity-80 mb-14 md:mb-16"
            />
            {/* One sentence with a refusal in it — "ולא", not "and also". A
                statement that refuses nothing is a platitude. tracking-normal
                and a loose leading throughout: letter-spacing breaks Hebrew
                rhythm and is the clearest tell of an un-adapted RTL design. */}
            <h1 className="font-display font-normal tracking-normal text-foreground text-start text-display max-w-[22ch]">
              אנחנו בונים ריהוט שנשאר בחוץ — ולא ריהוט שצריך להכניס.
            </h1>
          </Reveal>
        </div>
      </section>

      {/* 2 — The one homepage-language moment, placed AFTER the statement so it
          reads as its consequence rather than as decoration. */}
      <Reveal>
        <img
          src={craftDetail}
          alt="מפגש בין שלדת אלומיניום למשענת טיק"
          loading="eager"
          decoding="async"
          className="w-full aspect-[4/5] md:aspect-[16/9] object-cover"
        />
      </Reveal>

      {/* 3 — THE STORY. The brand's own paragraphs, with its strongest line
          promoted out of the block and set as a lead. */}
      <section className="bg-background">
        <div className="mx-auto max-w-[860px] px-6 py-24 md:py-32">
          <Reveal>
            <p className="max-w-[46ch] text-start text-foreground tracking-normal text-body">
              אלומה נולדה מתוך חיבור בין חומר לאור.
            </p>

            <div className="mt-10 max-w-[62ch] space-y-6 text-start text-foreground-soft tracking-normal text-small">
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
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4 — THE PEOPLE.
          ⚠️ mix-blend-multiply composites against the nearest stacking
          context, so this section needs its own explicit light background and
          the portraits' direct parent must carry no transform, opacity, filter
          or backdrop-blur. The Reveal wrapper is deliberately kept OFF that
          parent: put a transform on it and the drawings render as white
          boxes. */}
      <section className="bg-background">
        <div className="mx-auto max-w-[860px] px-6 pb-24 md:pb-32">
          <Reveal>
            <p className="max-w-[46ch] text-start text-foreground-soft tracking-normal text-small">
              שלושתנו. אותם אנשים מהמדידה הראשונה ועד היום שאתם יושבים בחוץ.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-3 gap-3 md:gap-10 bg-background">
            {people.map((p) => (
              <div key={p.name} className="bg-background">
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="w-full aspect-[3/4] object-contain object-bottom mix-blend-multiply"
                />
                <p className="mt-4 text-start text-small text-foreground">{p.name}</p>
                {/* A verb, not a job title — what someone does beats
"Co-Founder". This is the substitute for credentials. */}
                <p className="mt-1 text-start text-label text-foreground/55">
                  {p.does}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — WHAT WE DON'T DO. Carries the weight a stat strip would carry if
          there were numbers worth printing. Also the page's single permitted
          use of terracotta — a third colour used repeatedly is the fastest way
          to read as a template. */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-[860px] px-6 py-24 md:py-32">
          <Reveal>
            <h2 className="font-display font-normal tracking-normal text-start text-foreground text-body border-s-2 border-primary ps-5">
              מה אנחנו לא עושים
            </h2>
            <ul className="mt-10 max-w-[62ch] divide-y divide-foreground/10 border-t border-foreground/10">
              {refusals.map((line) => (
                <li
                  key={line}
                  className="py-5 text-start text-small text-foreground-soft"
                >
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 6 — The exhale before the close. */}
      <Reveal>
        <img
          src={terraceDusk}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="w-full aspect-[3/2] md:aspect-[21/9] object-cover"
        />
      </Reveal>

      {/* 7 — CLOSE. The wordmark returns, larger and faint. Bookending the page
          with the mark removes any need for a CTA button here. */}
      <section className="bg-background">
        <div className="mx-auto max-w-[860px] px-6 py-28 md:py-36 text-center">
          <Reveal>
            <p className="mx-auto max-w-[34ch] text-foreground tracking-normal text-body">
              אולם התצוגה שלנו ב{SITE.address.full}. הכי קל להבין את אלומה
              כשיושבים עליה.
            </p>
            <Link
              to={to("/faq") + "#contact"}
              className="mt-7 inline-block text-small text-primary underline underline-offset-[6px] decoration-1 hover:text-accent transition-colors"
            >
              לתיאום ביקור
            </Link>
            <img
              src={alumaLogo}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="mx-auto mt-20 md:mt-24 h-10 md:h-14 w-auto opacity-25"
            />
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default StoryPage;
