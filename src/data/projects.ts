import salonEucalyptus from "@/assets/collections/salon-eucalyptus.jpg";
import salonMarina from "@/assets/collections/salon-marina.jpg";
import salonSahara from "@/assets/collections/salon-sahara.jpg";
import salonMonolith from "@/assets/collections/salon-monolith.jpg";
import tableTerrazzo from "@/assets/collections/table-terrazzo.jpg";
import tableGranite from "@/assets/collections/table-granite.jpg";

import villaKfarShmaryahu1 from "@/assets/projects/gen/villa-kfar-shmaryahu-1.webp";
import villaKfarShmaryahu2 from "@/assets/projects/gen/villa-kfar-shmaryahu-2.webp";
import penthouseTelAviv1 from "@/assets/projects/gen/penthouse-tel-aviv-1.webp";
import penthouseTelAviv2 from "@/assets/projects/gen/penthouse-tel-aviv-2.webp";
import privateHouseHerzliya1 from "@/assets/projects/gen/private-house-herzliya-1.webp";
import privateHouseHerzliya2 from "@/assets/projects/gen/private-house-herzliya-2.webp";
import poolComplexRaanana1 from "@/assets/projects/gen/pool-complex-raanana-1.webp";
import poolComplexRaanana2 from "@/assets/projects/gen/pool-complex-raanana-2.webp";
import villaCaesarea1 from "@/assets/projects/gen/villa-caesarea-1.webp";
import villaCaesarea2 from "@/assets/projects/gen/villa-caesarea-2.webp";
import duplexModiin1 from "@/assets/projects/gen/duplex-modiin-1.webp";
import duplexModiin2 from "@/assets/projects/gen/duplex-modiin-2.webp";

export interface Project {
  slug: string;
  name: string;
  location: string;
  tag: string;
  year: string;
  area: string;
  cover: string;
  gallery: string[];
  intro: string;
  story: string[];
  scope: string[];
  materials: string[];
  /**
   * A genuine pre-installation photo of THIS space, paired with the finished
   * shot. Optional on purpose, and the module only renders when it is set:
   * the old /before-after page filled the "before" slot with catalogue photos
   * of finished furniture — one entry's "before" was another entry's "after" —
   * which presented invented transformations as our work. Never substitute a
   * shot to fill this. No pair, no module.
   */
  beforeAfter?: { before: string; after: string; note: string };
}

export const projects: Project[] = [
  {
    slug: "villa-kfar-shmaryahu",
    name: "וילה בכפר שמריהו",
    location: "כפר שמריהו",
    tag: "מרפסת פנורמית",
    year: "2024",
    area: "120 מ״ר",
    cover: salonMonolith,
    gallery: [salonMonolith, villaKfarShmaryahu1, villaKfarShmaryahu2],
    intro:
      "מרפסת פנורמית של 120 מ״ר שנפתחת אל קו ההרים, וביקשה שפה אחת שקטה לכל אורכה. תכננו מתחם ישיבה רחב לצד אזור ארוחות נפרד, כך שאירוח גדול לא הופך את המרחב לעמוס. סלון מונוליט בשחור מאט ושולחן גרניט פורצלן ארוך מחזיקים את הקו האדריכלי, תאורה חמה נסתרת מקיפה את הפינות, וצמחייה במיקום מדויק מפרידה בין האזורים בלי לחסום ולו סנטימטר מהנוף.",
    story: [
      "המשפחה ביקשה מרחב שיכיל אירוחים גדולים בלי להרגיש עמוס. בחרנו בסלון מונוליט בשחור מאט ובשולחן גרניט פורצלן ארוך, כדי לשמור על שפה אחת נקייה לאורך כל המרפסת.",
      "התאורה תוכננה בעדינות מסביב, וצמחיה במיקום מדויק מפרידה בין אזורי השימוש בלי לחסום את הנוף.",
    ],
    scope: [
      "סלון מונוליט פינתי בהתאמה אישית",
      "שולחן גרניט פורצלן ל־10 סועדים",
      "פינת קוקטייל עם שני כיסאות יחיד",
    ],
    materials: ["אלומיניום בציפוי מאט", "שיש גרניט פורצלן", "בד Sunbrella"],
  },
  {
    slug: "penthouse-tel-aviv",
    name: "פנטהאוז בתל אביב",
    location: "תל אביב",
    tag: "גג עירוני",
    year: "2024",
    area: "85 מ״ר",
    cover: salonMarina,
    gallery: [salonMarina, penthouseTelAviv1, penthouseTelAviv2],
    intro:
      "גג עירוני של 85 מ״ר מול הים, שהאתגר בו היה לייצר תחושת חופש דווקא במרחב מצומצם. בחרנו פלטה בהירה של חול, שמנת ולבן, ובדים שלא אוגרים חום גם בשיא הקיץ. כל פריט תוכנן בגובה מדויק כדי לא לחסום את קו הים, וכל המסגרות עברו ציפוי כפול נגד מליחות. התוצאה היא פינת מקלט ים תיכוני שקטה לגמרי, קומה אחת מעל קצב העיר.",
    story: [
      "האתגר היה ליצור תחושת חופש על גג קטן יחסית. בחרנו פלטה בהירה, חול, שמנת ולבן, ובדים שלא צוברים חום.",
      "כל פריט תוכנן עם גובה מדויק כדי לא לחסום את קו הים, וכל המסגרות עברו ציפוי כפול נגד מליחות.",
    ],
    scope: [
      "סלון מרינה מודולרי",
      "שולחן טרצו עגול ל־6 סועדים",
      "שני כורסאות יחיד עם הדומים",
    ],
    materials: ["אלומיניום ימי", "טרצו מינרלי", "בד Sunbrella בהיר"],
  },
  {
    slug: "private-house-herzliya",
    name: "בית פרטי בהרצליה",
    location: "הרצליה פיתוח",
    tag: "חצר משפחתית",
    year: "2023",
    area: "200 מ״ר",
    cover: salonEucalyptus,
    gallery: [salonEucalyptus, privateHouseHerzliya1, privateHouseHerzliya2],
    intro:
      "חצר משפחתית של 200 מ״ר עם דשא, בריכה ופינת אוכל, שהתבקשה להכיל גם אירוח גדול וגם יום־יום רגוע. חילקנו אותה לשלושה אזורים מובחנים שנשארים בשפה ויזואלית אחת: סלון אקליפטוס שמביא את החום הביתי, פינת טרצו שמארחת ארוחות שישי של שנים־עשר סועדים, ופינת בריכה עם מיטות שיזוף. כל חומר נבחר כך שיעמוד בשימוש יומיומי אינטנסיבי של ילדים, ויתנקה בקלות.",
    story: [
      "משפחה עם ילדים שרצתה גם מרחב לאירוח וגם פינה רכה ליום־יום. סלון אקליפטוס מספק את החום הביתי, ופינת האוכל בטרצו מארחת ארוחות שישי גדולות.",
      "כל החומרים נבחרו כך שיעמדו בשימוש יומיומי אינטנסיבי, ושיהיו קלים לניקוי.",
    ],
    scope: [
      "סלון אקליפטוס מודולרי",
      "שולחן טרצו ל־12 סועדים",
      "פינת בריכה עם שתי מיטות שיזוף",
    ],
    materials: ["עץ אקליפטוס FSC", "טרצו", "בד Sunbrella"],
  },
  {
    slug: "pool-complex-raanana",
    name: "מתחם בריכה ברעננה",
    location: "רעננה",
    tag: "אזור רחצה",
    year: "2024",
    area: "140 מ״ר",
    cover: salonSahara,
    gallery: [salonSahara, poolComplexRaanana1, poolComplexRaanana2],
    intro:
      "מתחם בריכה פרטי של 140 מ״ר, שהלקוחות ביקשו שירגיש כמו חופשה קבועה בבית. בנינו פלטת חול וטרקוטה עם מרקמים ארוגים ביד, שילבנו סלון סהרה לאווירת ריאד, והוספנו גומחות שיזוף יחידניות לצד שולחן גרניט לשמונה סועדים. אורות חמים נסתרים מתחת לרהיטים מאריכים את הערב, וכל הבדים והחבלים עמידים לכלור ולשמן שיזוף ומתנקים בקלות גם אחרי סוף שבוע עמוס.",
    story: [
      "הלקוחות ביקשו תחושה של חופשה קבועה בבית. בנינו פלטת חול וטרקוטה עם מרקמים ארוגים, ושילבנו אורות חמים נסתרים מתחת לרהיטים.",
      "כל הבדים והחבלים עמידים לכלור ולשמן שיזוף, ומתנקים בקלות גם אחרי שימוש אינטנסיבי.",
    ],
    scope: [
      "סלון סהרה ארוג ביד",
      "שולחן גרניט ל־8 סועדים",
      "ארבע מיטות שיזוף עם הצללה",
    ],
    materials: ["שלד אלומיניום", "חבל קלוע ביד", "גרניט פורצלן"],
  },
  {
    slug: "villa-caesarea",
    name: "וילה בקיסריה",
    location: "קיסריה",
    tag: "פינת אירוח",
    year: "2023",
    area: "95 מ״ר",
    cover: tableGranite,
    gallery: [tableGranite, villaCaesarea1, villaCaesarea2],
    intro:
      "פינת אירוח אינטימית של 95 מ״ר מול הים, בווילה אדריכלית שביקשה ריהוט שיתמזג ולא יבלוט. בחרנו גרפיט מאט עמוק וויתרנו על כל פרט מיותר, כך שהקו של הבית נשאר הגיבור. שולחן הגרניט נחתך לפי מידה במיוחד עבור המרחב, עם פאזות עדינות שמרככות את הקווים החדים של המבנה, וסלון מונוליט עוטף סוגר את הפינה. תאורה משולבת ברגלי הרהיטים מאירה את הרצפה בלבד.",
    story: [
      "וילה אדריכלית עם קווים נקיים שביקשה ריהוט שיתמזג ולא יבלוט. בחרנו בגרפיט מאט עמוק, וויתרנו על כל פרט מיותר.",
      "השולחן עוצב בחיתוך לפי מידה לוילה, עם פאזות עדינות שמרככות את הקווים החדים של הבית.",
    ],
    scope: [
      "שולחן גרניט פורצלן בהזמנה אישית",
      "סלון מונוליט בגרפיט מאט",
      "תאורה משולבת ברגלי הרהיטים",
    ],
    materials: ["שיש גרניט פורצלן", "אלומיניום בציפוי מאט", "בד Sunbrella"],
  },
  {
    slug: "duplex-modiin",
    name: "דופלקס במודיעין",
    location: "מודיעין",
    tag: "מרפסת מקורה",
    year: "2024",
    area: "60 מ״ר",
    cover: tableTerrazzo,
    gallery: [tableTerrazzo, duplexModiin1, duplexModiin2],
    intro:
      "מרפסת מקורה של 60 מ״ר לזוג צעיר, מרחב צנוע שדרש שכל סנטימטר יישב במקום הנכון. בחרנו שולחן טרצו עגול שמרכך את הקווים ומאפשר תנועה חופשית סביבו, סלון אקליפטוס קומפקטי שמספיק בדיוק לארבעה, ושני כיסאות בר שנשענים אל המעקה ומנצלים את קו הנוף. הפלטה חמה וקלילה, בלי שום עומס. התוצאה היא מרפסת שהפכה לחדר המועדף בבית, כל ערב מחדש.",
    story: [
      "מרחב צנוע שדורש כל סנטימטר במקום הנכון. בחרנו שולחן טרצו עגול שמרכך את הקווים, וסלון אקליפטוס קומפקטי שמספיק לארבעה.",
      "התוצאה: מרפסת שהפכה לחדר המועדף בבית, כל ערב מחדש.",
    ],
    scope: [
      "שולחן טרצו עגול ל־4 סועדים",
      "סלון אקליפטוס דו־מושבי",
      "שני כיסאות בר למשענת המעקה",
    ],
    materials: ["טרצו", "עץ אקליפטוס", "אלומיניום"],
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);
