import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLocalizedPath } from "@/lib/useLocalizedPath";
import { SITE } from "@/config/site";
import alumaLogo from "@/assets/aluma-logo.png";
import storyPortrait from "@/assets/story-portrait.png";
import storyPortraitRoy from "@/assets/story-portrait-roy.png";
import storyPortraitIdan from "@/assets/story-portrait-idan.png";
import { materials } from "@/data/materials";

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "דף הבית", item: "https://alumaoutdoor.com/" },
    { "@type": "ListItem", position: 2, name: "אודות", item: "https://alumaoutdoor.com/story" },
  ],
};

/**
 * אודות.
 *
 * The heart of the page is unchanged and protected: the brand paragraphs on the
 * right, the wordmark and the three line portraits on the left. What changed is
 * everything around them — the block used to sit alone in a full viewport of
 * white, which read as an unfinished page rather than a quiet one. It now opens
 * the page at its natural height, and two grounded sections follow it: the
 * materials we actually build with, and the showroom you can actually visit.
 * Real content only; no invented history, no invented numbers.
 */
const StoryPage = () => {
  const { to } = useLocalizedPath();

  return (
    <Layout>
      <SEO
        title="אודות | Aluma, ריהוט חוץ בעיצוב אישי"
        description="אלומה נולדה מתוך חיבור בין חומר לאור. מי אנחנו, איך אנחנו עובדים, ואיפה אפשר לפגוש את הריהוט מקרוב."
        path="/story"
        jsonLd={breadcrumbs}
      />

      <PageHero
        title="אודות"
        subtitle="מי אנחנו, למה אלומה נקראת ככה, ואיפה פוגשים אותנו."
      />

      {/* THE PRESERVED HEART — text beside wordmark + portraits. */}
      <section className="py-10 md:py-16 bg-background">
        <div className="container-luxury">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center max-w-7xl mx-auto">
            {/* Right (RTL first): the paragraph */}
            <Reveal className="order-1">
              <div className="space-y-3.5 text-foreground text-body text-right max-w-md">
                <p>אלומה נולדה מתוך חיבור בין חומר לאור.</p>

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

            {/* Left: wordmark above the three portraits — the protected block. */}
            <Reveal delay={120} className="order-2 flex flex-col items-center justify-center">
              <div className="flex justify-center mb-12 md:mb-[60px]">
                <img
                  src={alumaLogo}
                  alt="Aluma"
                  className="h-[58px] md:h-[77px] w-auto opacity-90"
                />
              </div>
              {/* One gradient, 10px deep, along the bottom edge only. An
                  earlier radial mask clipped the drawings — do not add one. */}
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
            </Reveal>
          </div>
        </div>
      </section>

      {/* WHAT WE BUILD WITH — real materials, linking to their real pages. */}
      <section className="py-14 md:py-20 bg-secondary">
        <div className="container-luxury">
          <Reveal>
            <h2 className="font-display font-bold text-[26px] md:text-[30px] text-foreground text-right">
              החומרים שאנחנו עובדים איתם
            </h2>
            <p className="mt-2 mb-8 text-[18px] leading-relaxed text-foreground-soft text-right max-w-2xl">
              ההחלטה הראשונה בכל פריט היא לא הצורה, אלא החומר. אלה הארבעה שאנחנו
              בונים איתם.
            </p>
          </Reveal>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {materials.map((m, i) => (
              <Reveal key={m.slug} delay={i * 70}>
                <li>
                  <Link to={to(`/materials/${m.slug}`)} className="group block text-right">
                    <div className="aspect-square overflow-hidden rounded-[14px]">
                      <img
                        src={m.image}
                        alt={m.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </div>
                    <h3 className="mt-3 text-[18px] leading-snug text-foreground decoration-1 underline-offset-4 group-hover:underline">
                      {m.name}
                    </h3>
                    <p className="mt-1 text-[15px] leading-snug text-foreground/55 line-clamp-2">
                      {m.tagline}
                    </p>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* COME MEET IT — the showroom, with the real address and a real door in. */}
      <section className="bg-foreground text-background">
        <div className="container-luxury py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 text-right">
            <Reveal>
              <h2 className="font-display font-bold text-[26px] md:text-[30px] leading-tight">
                הכי קל להבין את אלומה כשיושבים עליה
              </h2>
              <p className="mt-3 text-[18px] leading-relaxed text-background/75 max-w-xl">
                אולם התצוגה שלנו ב{SITE.address.full}. קפצו לבקר, שבו, תמששו את
                הבדים — או דברו איתנו קודם.
              </p>
            </Reveal>
            <Reveal delay={100}>
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
            </Reveal>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default StoryPage;
