import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "כמה זמן לוקח לקבל את ההזמנה?",
    a: "זמן האספקה הממוצע נע בין 5 ל-10 שבועות, בהתאם לזמינות הקולקציה ולהיקף ההזמנה. כבר במעמד הרכישה תקבלו הערכת זמן מסודרת, ואנו נדאג לעדכן אתכם לאורך כל התהליך – משלב ההזמנה ועד להגעת הריהוט לביתכם.",
  },
  {
    q: "האם הריהוט עמיד לתנאי חוץ?",
    a: "ריהוט החוץ שלנו מיוצר מחומרים שנבחרו במיוחד לתנאי האקלים בישראל: שלדת אלומיניום איכותית בצביעה בתנור, בדי Sunbrella עמידים בפני מים וקרינת UV, משטחי שיש גרניט פורצלן השומרים על מראה יוקרתי לאורך שנים, וכן משטחי Polystone איכותיים המשלבים עמידות גבוהה לצד מראה מודרני ואלגנטי. כל פריט מיועד לשימוש חיצוני בכל עונות השנה.",
  },
  {
    q: "מה איכות החומרים?",
    a: "כל קולקציה נבחרת בקפידה מתוך דגש על איכות, נוחות ועמידות. השילוב בין שלדת האלומיניום, בדי הפרימיום ומשטחי הגרניט פורצלן וה-Polystone יוצר ריהוט חוץ יוקרתי המיועד לשנים רבות של שימוש ואירוח.",
  },
  {
    q: "מה כוללת האחריות?",
    a: "אנו מעניקים אחריות על ריהוט החוץ בהתאם לסוג המוצר והרכיבים ממנו הוא מיוצר. האחריות נועדה להבטיח לכם שקט נפשי וביטחון ברכישה, וצוות השירות שלנו זמין לכל שאלה גם לאחר האספקה.",
  },
  {
    q: "כמה עולה ריהוט חוץ?",
    a: "מחירי ריהוט החוץ משתנים בהתאם לקולקציה, לגודל הסט ולפריטים הכלולים בו. אנו מציעים מגוון פתרונות המתאימים לצרכים ולסגנונות שונים, תוך הקפדה על איכות גבוהה ותמורה מצוינת לאורך זמן.",
  },
  {
    q: "האם יש הובלה והרכבה?",
    a: "הריהוט מסופק לבית הלקוח בתיאום מראש, ומורכב על ידי צוות מקצועי ומנוסה. אנו מקפידים על הובלה בטוחה, הרכבה מדויקת ופינוי האריזות, כדי שתוכלו ליהנות מחוויית רכישה מושלמת.",
  },
  {
    q: "איך מתחזקים את הריהוט?",
    a: "ריהוט החוץ שלנו תוכנן לדרוש תחזוקה מינימלית. ניקוי תקופתי של השלדה, הבדים והמשטחים באמצעות מים וחומרי ניקוי עדינים יסייע לשמור על מראה נקי ומרשים לאורך שנים.",
  },
  {
    q: "האם יש אולם תצוגה?",
    a: "אולם התצוגה שלנו, הממוקם ברחוב התמר 78, יציץ, פתוח בתיאום מראש. במקום תוכלו להתרשם ממגוון הקולקציות, להרגיש את איכות החומרים מקרוב ולקבל ייעוץ מקצועי בבחירת ריהוט החוץ המתאים ביותר עבורכם.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 md:py-32 bg-background">
      <div className="container-luxury max-w-3xl">
        <div className="text-center mb-16">
          <div className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            שאלות ותשובות
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-primary leading-tight">
            כל מה שרציתם
            <br />
            <span className="italic">לדעת</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-border bg-card rounded-sm px-6 hover:border-accent/40 transition-smooth"
            >
              <AccordionTrigger className="text-right hover:no-underline py-5 font-display text-lg text-primary hover:text-accent">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
