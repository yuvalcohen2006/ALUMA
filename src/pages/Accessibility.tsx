import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";

const AccessibilityPage = () => {
  return (
    <Layout>
      <SEO
        title="הצהרת נגישות | Aluma"
        description="הצהרת הנגישות של אתר Aluma, התאמות, אמצעי סיוע, יצירת קשר עם רכז הנגישות וטיפול בתקלות."
        path="/accessibility"
      />
      <section className="pt-32 pb-12 md:pt-40 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="נגישות" en="Accessibility" className="text-xs mb-5" />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight">
            הצהרת <span className="italic">נגישות</span>
          </h1>
          <div className="w-16 h-px bg-primary/30 mx-auto mt-8" />
        </div>
      </section>

      <section className="py-12 md:py-20 bg-background">
        <div className="container-luxury max-w-3xl prose-luxury text-foreground space-y-8 leading-relaxed text-right">
          <div>
            <h2 className="font-display text-2xl text-primary mb-3">המחויבות שלנו</h2>
            <p className="text-muted-foreground">
              Aluma רואה בנגישות האתר ערך עליון. אנו פועלים על מנת שאתר זה יהיה
              נגיש לאנשים עם מוגבלות, בהתאם לתקנות שוויון זכויות לאנשים עם
              מוגבלות (התאמות נגישות לשירות), התשע״ג-2013, ובהתאם לתקן הישראלי
              ת״י 5568 ברמת AA.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-primary mb-3">התאמות הנגישות באתר</h2>
            <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
              <li>תפריט נגישות צף בפינה השמאלית התחתונה בכל עמוד.</li>
              <li>אפשרות להגדלה והקטנה של גודל הטקסט.</li>
              <li>מצב ניגודיות גבוהה לקריאה נוחה יותר.</li>
              <li>הדגשת קישורים וקו תחתון לקישורים.</li>
              <li>מעבר לגופן קריא במיוחד (Arial).</li>
              <li>תמיכה בניווט מלא באמצעות מקלדת (Tab / Shift+Tab / Enter).</li>
              <li>טקסטים חלופיים (alt) לכל התמונות המשמעותיות.</li>
              <li>היררכיית כותרות סמנטית מסודרת לקוראי מסך.</li>
              <li>תיוג ARIA לרכיבים אינטראקטיביים.</li>
              <li>תאימות מלאה למכשירים ניידים וטאבלטים.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-primary mb-3">מגבלות ידועות</h2>
            <p className="text-muted-foreground">
              למרות מאמצינו, ייתכן ובאתר קיימים תכנים שטרם הונגשו במלואם, בעיקר
              תכנים שעודכנו לאחרונה או תוכן שמקורו בצד שלישי. אנו עובדים באופן
              שוטף על שיפור הנגישות ומתחייבים לטפל בכל פנייה תוך זמן סביר.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-primary mb-3">רכז הנגישות</h2>
            <p className="text-muted-foreground">
              נתקלתם בתקלת נגישות? יש לכם בקשה או הצעה לשיפור? נשמח לעמוד
              לשירותכם:
            </p>
            <ul className="mt-3 space-y-1 text-foreground">
              <li>טלפון: <a href="tel:0504519062" className="text-foreground underline hover:text-accent" dir="ltr">050-451-9062</a></li>
              <li>דוא״ל: <a href="mailto:info@aluma.co.il" className="text-foreground underline hover:text-accent" dir="ltr">info@aluma.co.il</a></li>
              <li>כתובת: התמר 78, יציץ</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border text-sm text-muted-foreground">
            הצהרה זו עודכנה לאחרונה ב־{new Date().toLocaleDateString("he-IL")}.
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AccessibilityPage;
