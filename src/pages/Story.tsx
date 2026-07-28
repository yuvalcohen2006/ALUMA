import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
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

      <PageHero title="הסיפור שלנו" />

      {/* Fills what's left of the viewport under the hero and centres its
          content in it, so the paragraph and the portraits both sit on the
          vertical middle of the screen. Horizontal placement is untouched. */}
      <section className="flex items-center min-h-[calc(100dvh-13rem)] py-8 md:py-10 bg-background">
        <div className="container-luxury w-full">
          {/* White section split down the middle into two equal squares */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 max-w-7xl mx-auto">
            {/* Right square (RTL first): the paragraph, centred */}
            <div className="order-1 flex items-center justify-center md:aspect-square">
              <div className="space-y-3.5 text-foreground text-body text-right max-w-md mx-auto pb-[15px]">
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
            </div>

            {/* Left square: picture with the logo above it */}
            <div className="order-2 flex flex-col items-center justify-center md:aspect-square">
              {/* Logo — +10%, centred */}
              <div className="flex justify-center mb-12 md:mb-[60px]">
                <img
                  src={alumaLogo}
                  alt="Aluma"
                  className="h-[58px] md:h-[77px] w-auto opacity-90"
                />
              </div>
              {/* Portraits — +10% again (wider max-width than the logo) */}
              <div className="flex items-end justify-center gap-[26px] w-full max-w-[813px] mx-auto">
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
