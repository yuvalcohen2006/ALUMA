import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";
import alumaLogo from "@/assets/aluma-logo.png";
import storyPortrait from "@/assets/story-portrait.png";
import storyPortraitRoy from "@/assets/story-portrait-roy.png";
import storyPortraitIdan from "@/assets/story-portrait-idan.png";

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "דף הבית", item: "https://alumaoutdoor.com/" },
    { "@type": "ListItem", position: 2, name: "הסיפור שלנו", item: "https://alumaoutdoor.com/story" },
  ],
};

const StoryPage = () => {
  return (
    <Layout>
      <SEO
        title="הסיפור שלנו | Aluma, ריהוט חוץ בעיצוב אישי"
        description="Aluma נולדה מתוך חיבור בין חומר לאור. סיפור המותג, הערכים והגישה לעיצוב סלוני חוץ יוקרתיים בייצור אישי לתנאי החוץ של ישראל."
        path="/story"
        jsonLd={breadcrumbs}
      />

      <section className="pt-32 pb-10 md:pt-40 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="הסיפור שלנו" en="Our Story" className="text-xs mb-5" />
          <div className="w-16 h-px bg-primary/30 mx-auto mb-10" />
        </div>
      </section>

      <section className="pt-8 pb-24 md:pt-12 md:pb-32 bg-background">
        <div className="container-luxury">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center max-w-7xl mx-auto">
            {/* Text column (right in RTL) */}
            <div className="order-1 md:order-1 md:pl-8 lg:pl-12 text-right relative">
              {/* Single small logo at top */}
              <div className="flex justify-end mb-6">
                <div className="inline-flex items-center gap-3">
                  <span className="block w-8 h-px bg-primary/30" />
                  <img
                    src={alumaLogo}
                    alt="Aluma"
                    className="h-7 md:h-8 w-auto opacity-90"
                  />
                  <span className="block w-8 h-px bg-primary/30" />
                </div>
              </div>

              <div className="space-y-3.5 text-primary/85 text-sm md:text-base leading-[1.75]">
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

                <p className="text-primary tracking-wide pt-1">
                  זו לא רק חוויה, זו איכות חיים.
                </p>
              </div>
            </div>

            {/* Portraits column (left in RTL) */}
            <div className="order-2 md:order-2 relative md:pr-8 lg:pr-12">
              <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-4/5 bg-primary/20" />
              <div className="flex items-end justify-center gap-[19px] w-full mx-auto">
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
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default StoryPage;
