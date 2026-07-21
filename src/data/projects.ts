import salonEucalyptus from "@/assets/collections/salon-eucalyptus.jpg";
import salonMarina from "@/assets/collections/salon-marina.jpg";
import salonSahara from "@/assets/collections/salon-sahara.jpg";
import salonMonolith from "@/assets/collections/salon-monolith.jpg";
import tableTerrazzo from "@/assets/collections/table-terrazzo.jpg";
import tableGranite from "@/assets/collections/table-granite.jpg";

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
    gallery: [salonMonolith, tableGranite, salonEucalyptus],
    intro:
      "מרפסת ענק עם נוף פתוח אל ההרים — תכננו מתחם ישיבה רחב ואזור ארוחות נפרד בקווים אדריכליים שקטים.",
    story: [
      "המשפחה ביקשה מרחב שיכיל אירוחים גדולים בלי להרגיש עמוס. בחרנו בסלון מונוליט בשחור מאט ובשולחן גרניט פורצלן ארוך, כדי לשמור על שפה אחת נקייה לאורך כל המרפסת.",
      "התאורה תוכננה בעדינות מסביב, וצמחיה במיקום מדויק מפרידה בין אזורי השימוש בלי לחסום את הנוף.",
    ],
    scope: [
      "סלון מונוליט פינתי בהתאמה אישית",
      "שולחן גרניט פורצלן ל-10 סועדים",
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
    gallery: [salonMarina, tableTerrazzo, salonSahara],
    intro:
      "גג עירוני עם נוף לים — סלון מרינה בהיר ושולחן טרצו יוצרים פינת מקלט ים תיכוני מעל קצב העיר.",
    story: [
      "האתגר היה ליצור תחושת חופש על גג קטן יחסית. בחרנו פלטה בהירה — חול, שמנת ולבן — ובדים שלא צוברים חום.",
      "כל פריט תוכנן עם גובה מדויק כדי לא לחסום את קו הים, וכל המסגרות עברו ציפוי כפול נגד מליחות.",
    ],
    scope: [
      "סלון מרינה מודולרי",
      "שולחן טרצו עגול ל-6 סועדים",
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
    gallery: [salonEucalyptus, tableTerrazzo, salonSahara],
    intro:
      "חצר משפחתית גדולה עם דשא, בריכה ופינת אוכל — תכננו שלושה אזורים מובחנים בשפה ויזואלית אחת.",
    story: [
      "משפחה עם ילדים שרצתה גם מרחב לאירוח וגם פינה רכה ליום־יום. סלון אקליפטוס מספק את החום הביתי, ופינת האוכל בטרצו מארחת ארוחות שישי גדולות.",
      "כל החומרים נבחרו כך שיעמדו בשימוש יומיומי אינטנסיבי — ושיהיו קלים לניקוי.",
    ],
    scope: [
      "סלון אקליפטוס מודולרי",
      "שולחן טרצו ל-12 סועדים",
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
    gallery: [salonSahara, salonMarina, tableGranite],
    intro:
      "מתחם בריכה פרטי — שילבנו סלון סהרה לאווירת ריאד עם פינת ארוחות וגומחות שיזוף יחידניות.",
    story: [
      "הלקוחות ביקשו תחושה של חופשה קבועה בבית. בנינו פלטת חול וטרקוטה עם מרקמים ארוגים, ושילבנו אורות חמים נסתרים מתחת לרהיטים.",
      "כל הבדים והחבלים עמידים לכלור ולשמן שיזוף, ומתנקים בקלות גם אחרי שימוש אינטנסיבי.",
    ],
    scope: [
      "סלון סהרה ארוג ביד",
      "שולחן גרניט ל-8 סועדים",
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
    gallery: [tableGranite, salonMonolith, salonEucalyptus],
    intro:
      "פינת אירוח אינטימית מול הים — שולחן גרניט מרכזי וסלון מונוליט עוטף, בשפה מינימליסטית.",
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
    gallery: [tableTerrazzo, salonEucalyptus, salonMarina],
    intro:
      "מרפסת מקורה לזוג צעיר — פינת אוכל אינטימית וסלון קטן בעיצוב חם וקליל.",
    story: [
      "מרחב צנוע שדורש כל סנטימטר במקום הנכון. בחרנו שולחן טרצו עגול שמרכך את הקווים, וסלון אקליפטוס קומפקטי שמספיק לארבעה.",
      "התוצאה: מרפסת שהפכה לחדר המועדף בבית, כל ערב מחדש.",
    ],
    scope: [
      "שולחן טרצו עגול ל-4 סועדים",
      "סלון אקליפטוס דו־מושבי",
      "שני כיסאות בר למשענת המעקה",
    ],
    materials: ["טרצו", "עץ אקליפטוס", "אלומיניום"],
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);
