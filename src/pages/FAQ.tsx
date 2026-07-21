import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionLabel from "@/components/SectionLabel";
import {
  Truck,
  Sun,
  Gem,
  ShieldCheck,
  Tag,
  Wrench,
  Sparkles,
  Eye,
} from "lucide-react";

const faqs = [
  {
    title: "זמן אספקה",
    q: "כמה זמן לוקח לקבל את ההזמנה?",
    a: "זמן האספקה הממוצע נע בין 5 ל-10 שבועות, בהתאם לזמינות הקולקציה ולהיקף ההזמנה. כבר במעמד הרכישה תקבלו הערכת זמן מסודרת, ואנו נדאג לעדכן אתכם לאורך כל התהליך – משלב ההזמנה ועד להגעת הריהוט לביתכם.",
    Icon: Truck,
  },
  {
    title: "עמידות לחוץ",
    q: "האם הריהוט עמיד לתנאי חוץ?",
    a: "ריהוט החוץ שלנו מיוצר מחומרים שנבחרו במיוחד לתנאי האקלים בישראל: שלדת אלומיניום איכותית בצביעה בתנור, בדי Sunbrella עמידים בפני מים וקרינת UV, משטחי שיש גרניט פורצלן השומרים על מראה יוקרתי לאורך שנים, וכן משטחי Polystone איכותיים המשלבים עמידות גבוהה לצד מראה מודרני ואלגנטי. כל פריט מיועד לשימוש חיצוני בכל עונות השנה.",
    Icon: Sun,
  },
  {
    title: "איכות החומרים",
    q: "מה איכות החומרים?",
    a: "כל קולקציה נבחרת בקפידה מתוך דגש על איכות, נוחות ועמידות. השילוב בין שלדת האלומיניום, בדי הפרימיום ומשטחי הגרניט פורצלן וה-Polystone יוצר ריהוט חוץ יוקרתי המיועד לשנים רבות של שימוש ואירוח.",
    Icon: Gem,
  },
  {
    title: "אחריות",
    q: "מה כוללת האחריות?",
    a: "אנו מעניקים אחריות על ריהוט החוץ בהתאם לסוג המוצר והרכיבים ממנו הוא מיוצר. האחריות נועדה להבטיח לכם שקט נפשי וביטחון ברכישה, וצוות השירות שלנו זמין לכל שאלה גם לאחר האספקה.",
    Icon: ShieldCheck,
  },
  {
    title: "מחיר",
    q: "כמה עולה ריהוט חוץ?",
    a: "מחירי ריהוט החוץ משתנים בהתאם לקולקציה, לגודל הסט ולפריטים הכלולים בו. אנו מציעים מגוון פתרונות המתאימים לצרכים ולסגנונות שונים, תוך הקפדה על איכות גבוהה ותמורה מצוינת לאורך זמן.",
    Icon: Tag,
  },
  {
    title: "הובלה והרכבה",
    q: "האם יש הובלה והרכבה?",
    a: "הריהוט מסופק לבית הלקוח בתיאום מראש, ומורכב על ידי צוות מקצועי ומנוסה. אנו מקפידים על הובלה בטוחה, הרכבה מדויקת ופינוי האריזות, כדי שתוכלו ליהנות מחוויית רכישה מושלמת.",
    Icon: Wrench,
  },
  {
    title: "תחזוקה",
    q: "איך מתחזקים את הריהוט?",
    a: "ריהוט החוץ שלנו תוכנן לדרוש תחזוקה מינימלית. ניקוי תקופתי של השלדה, הבדים והמשטחים באמצעות מים וחומרי ניקוי עדינים יסייע לשמור על מראה נקי ומרשים לאורך שנים.",
    Icon: Sparkles,
  },
  {
    title: "אולם תצוגה",
    q: "האם יש אולם תצוגה?",
    a: "אולם התצוגה שלנו, הממוקם ברחוב התמר 78, יציץ, פתוח בתיאום מראש. במקום תוכלו להתרשם ממגוון הקולקציות, להרגיש את איכות החומרים מקרוב ולקבל ייעוץ מקצועי בבחירת ריהוט החוץ המתאים ביותר עבורכם.",
    Icon: Eye,
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const FAQPage = () => {
  return (
    <Layout>
      <SEO
        title="שאלות ותשובות | Aluma — ריהוט חוץ יוקרתי"
        description="שאלות נפוצות על מוצרי Aluma: עמידות החומרים, זמני אספקה, התאמה אישית, אחריות וטיפול בריהוט חוץ — כל מה שחשוב לדעת לפני שמזמינים."
        path="/faq"
        jsonLd={faqSchema}
      />
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 gradient-cream">
        <div className="container-luxury text-center">
          <SectionLabel he="שאלות ותשובות" en="FAQ" className="text-xs mb-5" />
          <div className="w-16 h-px bg-primary/30 mx-auto mb-10" />
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container-luxury max-w-3xl">
          <div className="divide-y divide-border/60">
            {faqs.map((faq, i) => (
              <div key={i} className="py-7 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 mb-3">
                  <faq.Icon className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} />
                  <h3 className="font-display text-lg md:text-xl text-primary font-medium tracking-tight">
                    {faq.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[15px] font-light">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQPage;
