import sunbrellaImg from "@/assets/materials/sunbrella.jpg";
import aluminumImg from "@/assets/materials/aluminum.jpg";
import graniteImg from "@/assets/materials/granite.jpg";
import polystoneImg from "@/assets/materials/polystone.jpg";
import sunbrellaThumb from "@/assets/materials/thumbs/sunbrella.webp";
import aluminumThumb from "@/assets/materials/thumbs/aluminum.webp";
import graniteThumb from "@/assets/materials/thumbs/granite.webp";
import polystoneThumb from "@/assets/materials/thumbs/polystone.webp";

/**
 * The four materials the site shipped with, kept as the fallback.
 *
 * They used to BE the materials: a hardcoded list with a page each, which left
 * the admin no way to add a fifth or fix a word in the four. They live in
 * `site_materials` now (migration 20260917120000), and this list is what the
 * site shows when that table is missing, unreachable or empty — which is the
 * state of every deployment between the code going out and the SQL being run.
 *
 * The photographs stay in the bundle either way: the seeded rows carry no
 * image_url, so these are what those four rows are drawn with until someone
 * uploads a replacement. See PHOTOS below.
 */
export type BuiltInMaterial = {
  slug: string;
  name: string;
  name_en: string;
  tagline: string;
  tagline_en: string;
  /** Paragraphs of the explanation. */
  body: string[];
};

/** The bundled photograph and swatch for a material the site was born with. */
export const PHOTOS: Record<string, { image: string; thumb: string }> = {
  sunbrella: { image: sunbrellaImg, thumb: sunbrellaThumb },
  aluminum: { image: aluminumImg, thumb: aluminumThumb },
  "granite-porcelain": { image: graniteImg, thumb: graniteThumb },
  polystone: { image: polystoneImg, thumb: polystoneThumb },
};

export const BUILT_IN_MATERIALS: BuiltInMaterial[] = [
  {
    slug: "sunbrella",
    name: "בד Sunbrella",
    name_en: "Sunbrella fabric",
    tagline: "נוחות שלא נכנעת לשמש",
    tagline_en: "Comfort that doesn't give in to the sun",
    body: [
      "בדי Sunbrella הם תקן הזהב העולמי לבדי חוץ. נארגים מסיבים אקריליים שנצבעים בצבע מלא, כך שהצבע חלק מהסיב עצמו ולא נשטף, לא דוהה ולא מתעייף עם השנים.",
      "המגע רך כמו בד פנים, אך מתחת לחזות העדינה מסתתרת עמידות בלתי מתפשרת לשמש הישראלית, לרסס מלח, לכלור ולמים. כתמים נשטפים בקלות, והבד שומר על מראהו המקורי גם אחרי עונות ארוכות בחוץ.",
      "עמידות UV: צבע מלא בסיב, לא דוהה גם בשמש הישראלית. דוחה מים וכתמים בזכות ציפוי הידרופובי, עם עד 10 שנות אחריות יצרן בינלאומית.",
    ],
  },
  {
    slug: "aluminum",
    name: "אלומיניום",
    name_en: "Aluminium",
    tagline: "שלד אדריכלי שלא חולה ולא חולד",
    tagline_en: "An architectural frame that never rusts",
    body: [
      "האלומיניום שלנו עובר ציפוי אבקה תרמי בתנור בטמפרטורה גבוהה, תהליך שיוצר שכבה אחידה, עמוקה ועמידה הרבה יותר מצבע רגיל. התוצאה: מסגרת שנשארת חלקה ומדויקת שנים, גם מול הים, הגשם והשמש.",
      "המבנה קל משמעותית מברזל, אבל לא מתפשר על יציבות. הוא לא חולד, לא מתעקם ולא דורש תחזוקה, רק ניגוב מדי פעם. הקווים הנקיים מאפשרים לרהיט לדבר בשפה אדריכלית מינימליסטית ושקטה.",
      "מתאים לחצרות, לגגות ולבתים מול הים, ומיוצר בשחור מאט, לבן, ברונזה וכל גוון RAL בהזמנה.",
    ],
  },
  {
    slug: "granite-porcelain",
    name: "שיש גרניט פורצלן",
    name_en: "Porcelain stoneware",
    tagline: "כל לוח, יצירה בפני עצמה",
    tagline_en: "Every slab a piece of its own",
    body: [
      "גרניט פורצלן הוא החומר היוקרתי ביותר למשטחי חוץ, קשה כאבן, עמיד בפני שריטות, חום, כתמים וקרינת UV. בניגוד לשיש טבעי, הוא לא סופג נוזלים ולא דורש איטום מחדש.",
      "כל לוח נבחר בידנו ומעובד באמצעות חיתוך מדויק, ליטוש קצוות והתאמה אישית לכל שולחן. הטקסטורה והוורידים נשארים ייחודיים, אין שני לוחות זהים, וזה בדיוק היופי שבו.",
      "כוסות חמות, יין ושמן זית לא משאירים סימן, והלוח לא משנה גוון בשמש.",
    ],
  },
  {
    slug: "polystone",
    name: "PolyStone",
    name_en: "PolyStone",
    tagline: "פיסול בחומר מודרני, קל, עמיד ויוקרתי",
    tagline_en: "Sculptural, light and made for weather",
    body: [
      "PolyStone הוא חומר מרוכב מתקדם המשלב שרף פולימרי עם אבקת אבן טבעית, מקבל מראה ומגע של אבן יוקרתית, אך במשקל נמוך משמעותית ובעמידות גבוהה לכל תנאי החוץ.",
      "החומר מאפשר חופש עיצובי מלא: צורות פיסוליות, עיגולים מושלמים וקצוות חדים שלא ניתן להשיג באבן טבעית. גימור מאט אחיד, ללא תפרים, וגוונים אדריכליים שנשארים יציבים בשמש, בגשם וברסס מלח.",
      "עד 70% קל יותר מבטון, לא סופג מים ולא דורש איטום חוזר.",
    ],
  },
];
