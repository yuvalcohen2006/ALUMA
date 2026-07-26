import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
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

      {/* pt-24 clears the fixed header (h-24); the flex band below it is the part
          that shrank by 20px, with the title centred inside that band. */}
      <section className="pt-24 gradient-cream">
        <div className="container-luxury flex items-center justify-center h-[129px] md:h-[145px] text-center">
          {/* Heebo's glyphs sit at ~0.72em of the font-size, so 36px font-size
              renders roughly a 26px average character height. */}
          <h1 className="text-[36px] font-normal text-foreground-soft tracking-normal">
            הסיפור שלנו
          </h1>
        </div>
      </section>

      <section className="pt-[28px] pb-[28px] md:pt-[32px] md:pb-[32px] bg-background">
        <div className="container-luxury">
          {/* White section split down the middle into two equal squares */}
          <div className="relative grid md:grid-cols-2 gap-10 md:gap-14 max-w-7xl mx-auto">
            {/* Center split line */}
            <div
              className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-4/5 bg-primary/20"
              aria-hidden="true"
            />

            {/* Right square (RTL first): the paragraph, centred */}
            <div className="order-1 flex items-center justify-center md:aspect-square">
              <div className="space-y-3.5 text-foreground text-[18px] leading-[1.75] text-right max-w-md mx-auto">
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
              {/* Logo crest, centred above the portraits with 1.5× the gap */}
              <div className="flex justify-center mb-12 md:mb-[60px]">
                <img
                  src={alumaLogo}
                  alt="Aluma"
                  className="h-12 md:h-16 w-auto opacity-90"
                />
              </div>
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
