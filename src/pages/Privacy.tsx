import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";

const PrivacyPage = () => {
  return (
    <Layout>
      <SEO
        title="מדיניות פרטיות | Aluma"
        description="מדיניות הפרטיות של אתר Aluma, איזה מידע נאסף, איך הוא מאוחסן, מי נחשף אליו וזכויות המשתמשים."
        path="/privacy"
      />
      <section className="pt-32 pb-12 md:pt-40 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="פרטיות" en="Privacy" className="text-xs mb-5" />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-primary leading-tight">
            מדיניות <span className="italic">פרטיות</span>
          </h1>
          <div className="w-16 h-px bg-primary/30 mx-auto mt-8" />
        </div>
      </section>

      <section className="py-12 md:py-20 bg-background">
        <div className="container-luxury max-w-3xl space-y-8 leading-relaxed text-right">
          <p className="text-muted-foreground">
            Aluma מכבדת את פרטיות המשתמשים באתר. מדיניות זו מסבירה איזה מידע
            נאסף, לאיזה שימוש, ואילו זכויות עומדות לרשותכם בנוגע למידע שלכם.
          </p>

          <div>
            <h2 className="font-display text-2xl text-primary mb-3">המידע שאנו אוספים</h2>
            <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
              <li>פרטים שאתם מוסרים מרצונכם בטופס יצירת הקשר: שם, טלפון, מייל ותוכן ההודעה.</li>
              <li>מידע טכני אנונימי הנאסף אוטומטית: סוג דפדפן, מערכת הפעלה, רזולוציה ועמודים שבהם ביקרתם.</li>
              <li>נתוני אנליטיקה לצורך שיפור חוויית המשתמש (Google Analytics וכלים דומים).</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-primary mb-3">השימוש במידע</h2>
            <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
              <li>יצירת קשר חוזר לצורך מתן הצעת מחיר ושירות.</li>
              <li>שיפור האתר, הקולקציות והשירות.</li>
              <li>שליחת עדכונים שיווקיים, רק אם נתתם לכך הסכמה מפורשת.</li>
              <li>עמידה בדרישות חוקיות.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-primary mb-3">שיתוף מידע</h2>
            <p className="text-muted-foreground">
              איננו מוכרים, משכירים או מעבירים מידע אישי לצדדים שלישיים, פרט
              לספקי שירות הפועלים מטעמנו (כגון שירותי מייל, אחסון ענן או
              ניתוח נתונים) והמחויבים לשמירת סודיות, או כאשר הדבר נדרש על פי
              חוק.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-primary mb-3">עוגיות (Cookies)</h2>
            <p className="text-muted-foreground">
              האתר עושה שימוש בעוגיות לצורך ניתוח תעבורה, שמירת העדפות (למשל
              הגדרות תפריט הנגישות) ושיפור החוויה. ניתן לחסום עוגיות דרך הגדרות
              הדפדפן, אך חלק מהפונקציונליות עשוי להיפגע.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-primary mb-3">אבטחת מידע</h2>
            <p className="text-muted-foreground">
              אנו נוקטים באמצעי אבטחה סבירים ומקובלים בענף לשמירת המידע. עם
              זאת, אין מערכת מאובטחת לחלוטין, ואיננו יכולים להבטיח מניעה מוחלטת
              של גישה בלתי מורשית.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-primary mb-3">הזכויות שלכם</h2>
            <p className="text-muted-foreground">
              בהתאם לחוק הגנת הפרטיות, התשמ״א-1981, עומדת לכם הזכות לעיין במידע
              האישי שמוחזק עליכם, לבקש את תיקונו או מחיקתו, ולהסיר עצמכם מרשימת
              דיוור. לפניות בנושא:{" "}
              <a href="mailto:info@aluma.co.il" className="text-primary hover:text-accent" dir="ltr">
                info@aluma.co.il
              </a>
              .
            </p>
          </div>

          <div className="pt-4 border-t border-border text-sm text-muted-foreground">
            עודכן לאחרונה: {new Date().toLocaleDateString("he-IL")}.
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPage;
