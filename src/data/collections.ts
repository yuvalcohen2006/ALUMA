import salonEucalyptus from "@/assets/collections/salon-eucalyptus.jpg";
import salonMarina from "@/assets/collections/salon-marina.jpg";
import salonSahara from "@/assets/collections/salon-sahara.jpg";
import salonMonolith from "@/assets/collections/salon-monolith.jpg";
import tableTeak from "@/assets/collections/table-teak.jpg";
import tableTerrazzo from "@/assets/collections/table-terrazzo.jpg";
import tableAluminum from "@/assets/collections/table-aluminum.jpg";
import tableGranite from "@/assets/collections/table-granite.jpg";

export type CollectionCategory = "salons" | "tables";

export interface CollectionItem {
  slug: string;
  category: CollectionCategory;
  name: string;
  tag: string;
  image: string;
  gallery?: string[];
  tagline: string;
  description: string[];
  highlights: { title: string; desc: string }[];
  materials: string[];
  dimensions?: string;
}

export const collectionItems: CollectionItem[] = [
  {
    slug: "salon-eucalyptus",
    category: "salons",
    name: "סלון אקליפטוס",
    tag: "קלאסי",
    image: salonEucalyptus,
    tagline: "חמימות טבעית במגע אדריכלי",
    description: [
      "סלון אקליפטוס משלב את החום של עץ אקליפטוס מלא עם שלד אלומיניום שקט, ויוצר ישיבה שמרגישה ביתית גם תחת שמיים פתוחים.",
      "כריות Sunbrella עבות מעטפות את הגוף בנוחות עמוקה, וזוויות הישיבה תוכננו לערבי אירוח ארוכים — לא רק לצילום.",
    ],
    highlights: [
      { title: "עץ אקליפטוס FSC", desc: "מעובד וחתום, מתאים לשימוש חוץ קבוע." },
      { title: "ישיבה עמוקה", desc: "כריות 12 ס״מ ממולאות בקצף בצפיפות גבוהה." },
      { title: "בנייה מודולרית", desc: "ניתן להרכיב כספה, פינתי או שני יחידים נפרדים." },
    ],
    materials: ["עץ אקליפטוס מלא", "אלומיניום בציפוי אבקה", "בד Sunbrella"],
    dimensions: "אורך 240 ס״מ · עומק 92 ס״מ · גובה 78 ס״מ",
  },
  {
    slug: "salon-marina",
    category: "salons",
    name: "סלון מרינה",
    tag: "ימי",
    image: salonMarina,
    tagline: "השראה מהים, עמידות של נמל",
    description: [
      "סלון מרינה נולד מהשראה של מרינות הים התיכון — קווים נקיים, גוונים בהירים ובדים שלא נכנעים למלח, לרוח ולשמש.",
      "מתאים במיוחד לבתים מול הים, לחצרות פתוחות ולמרפסות גג. כל פרט נבחר כך שיישאר יפה אחרי עשור של מליחות.",
    ],
    highlights: [
      { title: "מסגרת נגד מלח", desc: "אלומיניום ימי בציפוי אבקה כפול." },
      { title: "בדים בהירים", desc: "Sunbrella בגוונים חוליים שלא צוברים חום." },
      { title: "תפרים אטומים", desc: "תפירה כפולה בחוט טפלון לעמידות מקסימלית." },
    ],
    materials: ["אלומיניום ימי", "בד Sunbrella", "חבל ימי קלוע"],
    dimensions: "אורך 260 ס״מ · עומק 95 ס״מ · גובה 76 ס״מ",
  },
  {
    slug: "salon-sahara",
    category: "salons",
    name: "סלון סהרה",
    tag: "בוהו יוקרתי",
    image: salonSahara,
    tagline: "מרקמים חמים, נשמה של מדבר",
    description: [
      "סהרה הוא הסלון של ערבי שישי ארוכים. שילוב של גוונים חוליים, מרקמים ארוגים ביד ובד Sunbrella בגווני טרקוטה ושמנת.",
      "אווירה של ריאד מרוקאי בלי לוותר על עמידות חיצונית מלאה.",
    ],
    highlights: [
      { title: "ארוג ביד", desc: "פאנלים קלועים בעבודת יד בחבל סינטטי עמיד." },
      { title: "גוונים חמים", desc: "פלטה של חול, טרקוטה ושמנת." },
      { title: "ישיבה רכה", desc: "כריות עבות עם תחושת ספה ביתית." },
    ],
    materials: ["שלד אלומיניום", "חבל קלוע ביד", "בד Sunbrella"],
    dimensions: "אורך 280 ס״מ · עומק 100 ס״מ · גובה 80 ס״מ",
  },
  {
    slug: "salon-monolith",
    category: "salons",
    name: "סלון מונוליט",
    tag: "אדריכלי",
    image: salonMonolith,
    tagline: "פיסול אדריכלי בקווים שקטים",
    description: [
      "מונוליט הוא סלון פסל. גושים נקיים, זוויות חדות וצבע אחד עמוק שמדבר בשפה של אדריכלות מודרנית.",
      "מתאים לבתים בעיצוב מינימליסטי, לגינות גיאומטריות ולמרפסות גג עירוניות.",
    ],
    highlights: [
      { title: "גוש אחד", desc: "מראה מונוליטי ללא רגליים גלויות." },
      { title: "גוונים מאט", desc: "שחור פחם, גרפיט או חול — בגימור מאט." },
      { title: "כריות בעבודת מידה", desc: "מילוי קצוף בצפיפות גבוהה, ציפוי Sunbrella." },
    ],
    materials: ["אלומיניום בציפוי מאט", "בד Sunbrella", "קצף בצפיפות גבוהה"],
    dimensions: "אורך 300 ס״מ · עומק 105 ס״מ · גובה 72 ס״מ",
  },
  {
    slug: "table-teak",
    category: "tables",
    name: "שולחן טיק מלא",
    tag: "עץ טבעי",
    image: tableTeak,
    tagline: "עץ הטיק — בחירת היאכטות כבר 200 שנה",
    description: [
      "טיק הוא העץ היוקרתי בעולם לשימוש חוץ — שמנים טבעיים שמגנים עליו מפני מים, רקבון ושמש.",
      "כל שולחן מעובד מלוחות מלאים, עם פיניש שמן שמדגיש את הוורידים הטבעיים.",
    ],
    highlights: [
      { title: "שמנים טבעיים", desc: "הטיק מייצר שמן פנימי שדוחה מים מטבעו." },
      { title: "מתבגר יפה", desc: "מקבל פטינה כסופה אצילית עם השנים." },
      { title: "לוחות מלאים", desc: "לא ציפוי — עץ אמיתי לכל העובי." },
    ],
    materials: ["עץ טיק מלא FSC", "ברגי נירוסטה 316"],
    dimensions: "200×100 ס״מ · גובה 75 ס״מ",
  },
  {
    slug: "table-terrazzo",
    category: "tables",
    name: "שולחן טרצו",
    tag: "אבן",
    image: tableTerrazzo,
    tagline: "מרקם איטלקי מודרני בכל ארוחה",
    description: [
      "משטח טרצו אמיתי בעבודת יד — שברי אבן טבעיים המשובצים במלט מינרלי ומלוטשים בגימור משיי.",
      "כל שולחן ייחודי, ואין שני משטחים זהים. שילוב נדיר של מסורת איטלקית עם מראה עכשווי לחלוטין.",
    ],
    highlights: [
      { title: "עבודת יד", desc: "יצוק ומלוטש ידנית באיטליה." },
      { title: "מראה ייחודי", desc: "כל לוח שונה — דגם וצבע חד-פעמיים." },
      { title: "עמיד לחום", desc: "סיר חם או נר לא משאירים סימן." },
    ],
    materials: ["טרצו מינרלי", "שלד אלומיניום בציפוי אבקה"],
    dimensions: "220×100 ס״מ · גובה 75 ס״מ",
  },
  {
    slug: "table-aluminum",
    category: "tables",
    name: "שולחן אלומיניום",
    tag: "מינימליסטי",
    image: tableAluminum,
    tagline: "קווים נקיים, נוכחות שקטה",
    description: [
      "השולחן המינימליסטי האולטימטיבי — משטח אלומיניום אחד נקי, ללא תפרים גלויים, על שלד דק ומדויק.",
      "פתרון מושלם למרפסות עירוניות ולגינות מודרניות שמחפשות שקט אסתטי.",
    ],
    highlights: [
      { title: "משטח חלק", desc: "אלומיניום בגימור מאט ללא תפרים." },
      { title: "קל להזיז", desc: "משקל נמוך, יציבות גבוהה." },
      { title: "אפס תחזוקה", desc: "ניגוב עם מטלית לחה — וזהו." },
    ],
    materials: ["אלומיניום בציפוי אבקה תרמי"],
    dimensions: "180×90 ס״מ · גובה 74 ס״מ",
  },
  {
    slug: "table-granite",
    category: "tables",
    name: "שולחן גרניט",
    tag: "יוקרתי",
    image: tableGranite,
    tagline: "השולחן שיישאר בבית לדורות",
    description: [
      "משטח גרניט פורצלן מלוטש, חתוך לפי מידה ומונח על שלד אלומיניום אדריכלי.",
      "החומר היוקרתי ביותר למשטחי חוץ — לא נסדק, לא נכתם, לא דוהה. שולחן שעובר בירושה.",
    ],
    highlights: [
      { title: "פורצלן אמיתי", desc: "עמיד יותר מגרניט טבעי, בלי איטום." },
      { title: "ייחודי", desc: "כל לוח עם דגם וורידים משלו." },
      { title: "התאמה מלאה", desc: "מידות, צורות וגוונים לפי המרחב שלך." },
    ],
    materials: ["שיש גרניט פורצלן", "אלומיניום בציפוי אבקה"],
    dimensions: "240×110 ס״מ · גובה 75 ס״מ",
  },
];

export const getCollectionItem = (slug: string) =>
  collectionItems.find((c) => c.slug === slug);

export const collectionsByCategory = (cat: CollectionCategory) =>
  collectionItems.filter((c) => c.category === cat);
