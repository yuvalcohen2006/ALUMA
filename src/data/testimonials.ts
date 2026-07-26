/**
 * ⚠️ PLACEHOLDER / DEMO CONTENT — DO NOT SHIP AS REAL REVIEWS.
 *
 * These testimonials are fabricated for design preview only. Publishing invented,
 * named customer reviews on the live site would be deceptive advertising. Before
 * this section goes public, replace every `brand: false` entry below with a real,
 * attributed customer quote (with the customer's consent). The `brand: true`
 * cards are Aluma's own voice and are fine to keep.
 *
 * (This mirrors the earlier removal noted in src/pages/Index.tsx.)
 */

export interface Testimonial {
  /** Review / statement body (Hebrew). */
  text: string;
  /** Display name — a person for customer cards, "Aluma" for brand cards. */
  name: string;
  /** Sub-label: city for customers, the topic for brand cards. */
  role: string;
  /** Star rating, 4 or 5. */
  rating: 4 | 5;
  /** Brand card = Aluma's own voice; uses the favicon as the avatar. */
  brand?: boolean;
  /** Initials for the customer avatar (ignored for brand cards). */
  initials?: string;
}

/** Aluma logo mark (served from /public), used as the avatar on brand-voice cards. */
export const brandAvatar = "/favicon.png";

export const testimonials: Testimonial[] = [
  {
    text: "הצוות של Aluma ליווה אותנו מהסקיצה הראשונה ועד ההתקנה. הסלון שקיבלנו מרגיש יוקרתי, והבד לא דהה גם אחרי קיץ שלם בשמש.",
    name: "נועה ברקוביץ'",
    role: "הרצליה",
    rating: 5,
    initials: "נב",
  },
  {
    text: "אנחנו בוחרים אחד־אחד את החומרים הטובים ביותר: אלומיניום בציפוי מאט, בדי Sunbrella ושיש גרניט פורצלן — כדי שכל פריט ישרוד שנים של שמש, גשם ומלח.",
    name: "Aluma",
    role: "החומרים שלנו",
    rating: 5,
    brand: true,
  },
  {
    text: "החומרים פשוט ברמה אחרת. שולחן הגרניט עמיד להפליא, וגם אחרי אירוחים גדולים הוא נראה כמו ביום הראשון.",
    name: "דניאל אבטליון",
    role: "כפר סבא",
    rating: 5,
    initials: "דא",
  },
  {
    text: "המרפסת שלנו הפכה לחדר האהוב בבית. איכות הריפוד והתפירה יוצאת דופן — ניכרת תשומת לב לכל פרט.",
    name: "יואב שטרן",
    role: "תל אביב",
    rating: 4,
    initials: "יש",
  },
  {
    text: "עבודה מקצועית ומדויקת. הגיעו בזמן, הקשיבו לכל בקשה, והתוצאה הסופית עלתה על כל הציפיות שלנו.",
    name: "מיכל וקנין",
    role: "רמת השרון",
    rating: 5,
    initials: "מו",
  },
  {
    text: "בחרנו ב-Aluma אחרי התלבטות ארוכה, וזו הייתה החלטה מצוינת. אלומיניום איכותי שלא מחליד, ושירות אישי לאורך כל התהליך.",
    name: "רונית להב",
    role: "קיסריה",
    rating: 5,
    initials: "רל",
  },
  {
    text: "כל פריט נבנה בהתאמה אישית, בקווים נקיים ומדויקים, מתוך מחשבה על עיצוב, על נוחות ועל עמידות מלאה בתנאי חוץ.",
    name: "Aluma",
    role: "העיצוב שלנו",
    rating: 5,
    brand: true,
  },
  {
    text: "קיבלנו פינת אוכל מושלמת לגינה. הבד עמיד למים ולכתמים וקל מאוד לתחזוקה. ממליצים בחום.",
    name: "אורי גולן",
    role: "מודיעין",
    rating: 4,
    initials: "אג",
  },
  {
    text: "מהרגע הראשון הרגשנו בידיים טובות. צוות מקצועי, אדיב ובעל עין לעיצוב, והרהיטים מחזיקים מעמד מצוין גם מול אוויר הים.",
    name: "תמר פרידמן",
    role: "נתניה",
    rating: 5,
    initials: "תפ",
  },
  {
    text: "השקעה שמשתלמת. שנתיים אחרי, הריהוט נראה חדש לגמרי — חומרים פרימיום וגימור ללא דופי.",
    name: "אלון מזרחי",
    role: "רעננה",
    rating: 5,
    initials: "אמ",
  },
  {
    text: "תהליך נעים ומקצועי מתחילתו ועד סופו. קיבלנו בדיוק את מה שרצינו, ואפילו קצת יותר.",
    name: "שירה דוד",
    role: "זכרון יעקב",
    rating: 4,
    initials: "שד",
  },
  {
    text: "רהיטים שנראים מדהים ומחזיקים מעמד. ההזמנה הגיעה בזמן, וההרכבה בוצעה במקצועיות ובניקיון.",
    name: "גיא הראל",
    role: "סביון",
    rating: 5,
    initials: "גה",
  },
];
