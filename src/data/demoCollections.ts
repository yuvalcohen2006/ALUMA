import type { DBCollection, DBProduct } from "@/hooks/useCollectionsData";

import salonCornerA from "@/assets/collections/gen/salon-corner-a.webp";
import salonCornerB from "@/assets/collections/gen/salon-corner-b.webp";
import salonDuoA from "@/assets/collections/gen/salon-duo-a.webp";
import salonDuoB from "@/assets/collections/gen/salon-duo-b.webp";
import fireTableA from "@/assets/collections/gen/fire-table-a.webp";
import fireRoundA from "@/assets/collections/gen/fire-round-a.webp";
import fireRoundB from "@/assets/collections/gen/fire-round-b.webp";
import fireLongA from "@/assets/collections/gen/fire-long-a.webp";
import fireLongB from "@/assets/collections/gen/fire-long-b.webp";
import barStoolsA from "@/assets/collections/gen/bar-stools-a.webp";
import barIslandA from "@/assets/collections/gen/bar-island-a.webp";
import barIslandB from "@/assets/collections/gen/bar-island-b.webp";
import diningTableA from "@/assets/collections/gen/dining-table-a.webp";
import diningTableB from "@/assets/collections/gen/dining-table-b.webp";
import diningChairA from "@/assets/collections/gen/dining-chair-a.webp";
import diningBenchA from "@/assets/collections/gen/dining-bench-a.webp";
import loungerA from "@/assets/collections/gen/lounger-a.webp";
import loungerB from "@/assets/collections/gen/lounger-b.webp";
import swingA from "@/assets/collections/gen/swing-a.webp";
import swingB from "@/assets/collections/gen/swing-b.webp";

/**
 * Placeholder catalogue — NOT real Aluma products.
 *
 * Twenty invented pieces across five categories, used only to see how the
 * collections page and its filter behave with a real amount of stock in them.
 * `useCollectionsData` falls back to this in development when the database
 * comes back empty; as soon as there are published rows the real ones win, and
 * production never shows it. Delete this file and its import to remove it.
 */

export const demoCollections: DBCollection[] = [
  {
    id: "demo-salons",
    slug: "salons",
    name_he: "סלוני חוץ",
    name_en: "Outdoor Salons",
    intro: "מערכות ישיבה מודולריות שנבנות סביב המרחב שלכם, לא להפך.",
    image_url: salonCornerA,
    sort_order: 1,
  },
  {
    id: "demo-fire",
    slug: "fire-tables",
    name_he: "שולחנות אש",
    name_en: "Fire Tables",
    intro: "להבה שקטה במרכז הישיבה, שמאריכה את הערב הרבה אחרי השקיעה.",
    image_url: fireRoundA,
    sort_order: 2,
  },
  {
    id: "demo-bar",
    slug: "bar",
    name_he: "פינות בר",
    name_en: "Bar",
    intro: "עמדות בר וכיסאות גבוהים לגג, למרפסת ולחצר.",
    image_url: barIslandA,
    sort_order: 3,
  },
  {
    id: "demo-dining",
    slug: "dining",
    name_he: "פינות אוכל",
    name_en: "Dining",
    intro: "שולחנות בפורצלן ובאבן, עם כיסאות וספסלים שנבנים לצידם.",
    image_url: diningTableA,
    sort_order: 4,
  },
  {
    id: "demo-lounge",
    slug: "lounge",
    name_he: "שיזוף ונדנדות",
    name_en: "Lounge",
    intro: "מיטות שיזוף ונדנדות תלויות לפינות השקטות של הבית.",
    image_url: loungerA,
    sort_order: 5,
  },
];

type DemoSeed = {
  slug: string;
  name: string;
  tag: string;
  tagline: string;
  cover: string;
  dimensions: string;
  materials: string[];
};

const seeds: Record<string, DemoSeed[]> = {
  "demo-salons": [
    {
      slug: "monolit",
      name: "מונוליט",
      tag: "סלון פינתי",
      tagline: "קו אחד ארוך שסוגר את הפינה",
      cover: salonCornerA,
      dimensions: "320 × 260 ס״מ",
      materials: ["אלומיניום", "בד Sunbrella"],
    },
    {
      slug: "eucalyptus",
      name: "אאוקליפטוס",
      tag: "סלון מודולרי",
      tagline: "יחידות שמתחברות מחדש בכל עונה",
      cover: salonCornerB,
      dimensions: "מודולרי, מ-240 ס״מ",
      materials: ["אלומיניום", "בד Sunbrella"],
    },
    {
      slug: "marina",
      name: "מרינה",
      tag: "ספה דו-מושבית",
      tagline: "שניים, קפה, ובוקר שלם",
      cover: salonDuoA,
      dimensions: "180 × 90 ס״מ",
      materials: ["אלומיניום", "בד Sunbrella"],
    },
    {
      slug: "sahara",
      name: "סהרה",
      tag: "כורסת נוח",
      tagline: "הכורסה שאף אחד לא קם ממנה",
      cover: salonDuoB,
      dimensions: "95 × 90 ס״מ",
      materials: ["אלומיניום", "בד Sunbrella"],
    },
  ],
  "demo-fire": [
    {
      slug: "lahav",
      name: "להב",
      tag: "שולחן אש מלבני",
      tagline: "פס אש נקי לאורך הלוח",
      cover: fireTableA,
      dimensions: "140 × 80 ס״מ",
      materials: ["שיש גרניט פורצלן", "אלומיניום"],
    },
    {
      slug: "gahelet",
      name: "גחלת",
      tag: "שולחן אש עגול",
      tagline: "מעגל שמושך את כולם פנימה",
      cover: fireRoundA,
      dimensions: "קוטר 110 ס״מ",
      materials: ["PolyStone"],
    },
    {
      slug: "wadi",
      name: "ואדי",
      tag: "שולחן אש עגול",
      tagline: "נמוך, רחב, ופתוח לכל הכיוונים",
      cover: fireRoundB,
      dimensions: "קוטר 130 ס״מ",
      materials: ["PolyStone"],
    },
    {
      slug: "tamid",
      name: "תמיד",
      tag: "שולחן אש מלבני",
      tagline: "אש שנשארת דולקת עד סוף הערב",
      cover: fireLongA,
      dimensions: "200 × 90 ס״מ",
      materials: ["שיש גרניט פורצלן", "אלומיניום"],
    },
    {
      slug: "shalhevet",
      name: "שלהבת",
      tag: "שולחן אש מלבני",
      tagline: "הגרסה הארוכה, לאירוח גדול",
      cover: fireLongB,
      dimensions: "240 × 90 ס״מ",
      materials: ["שיש גרניט פורצלן", "אלומיניום"],
    },
  ],
  "demo-bar": [
    {
      slug: "ofek",
      name: "אופק",
      tag: "כיסא בר",
      tagline: "גובה שמסתכל אל הנוף",
      cover: barStoolsA,
      dimensions: "גובה מושב 75 ס״מ",
      materials: ["אלומיניום", "חבל ימי"],
    },
    {
      slug: "namal",
      name: "נמל",
      tag: "בר אי",
      tagline: "עמדה שעומדת בפני עצמה",
      cover: barIslandA,
      dimensions: "180 × 70 ס״מ",
      materials: ["PolyStone", "שיש גרניט פורצלן"],
    },
    {
      slug: "ratzif",
      name: "רציף",
      tag: "בר אי",
      tagline: "משטח עבודה ואירוח באותו קו",
      cover: barIslandB,
      dimensions: "220 × 70 ס״מ",
      materials: ["PolyStone", "שיש גרניט פורצלן"],
    },
  ],
  "demo-dining": [
    {
      slug: "terrazzo",
      name: "טרצו",
      tag: "שולחן אוכל",
      tagline: "לוח אחד, שמונה מקומות",
      cover: diningTableA,
      dimensions: "240 × 100 ס״מ",
      materials: ["שיש גרניט פורצלן", "אלומיניום"],
    },
    {
      slug: "granit",
      name: "גרניט",
      tag: "שולחן אוכל",
      tagline: "הגרסה הארוכה, לשולחן שלא נגמר",
      cover: diningTableB,
      dimensions: "300 × 110 ס״מ",
      materials: ["שיש גרניט פורצלן", "אלומיניום"],
    },
    {
      slug: "omer",
      name: "עומר",
      tag: "כיסא אוכל",
      tagline: "משענת קלועה שנושמת בשמש",
      cover: diningChairA,
      dimensions: "58 × 60 ס״מ",
      materials: ["אלומיניום", "חבל ימי"],
    },
    {
      slug: "shevil",
      name: "שביל",
      tag: "ספסל",
      tagline: "צד אחד של השולחן, בלי לספור כיסאות",
      cover: diningBenchA,
      dimensions: "200 × 40 ס״מ",
      materials: ["אלומיניום", "בד Sunbrella"],
    },
  ],
  "demo-lounge": [
    {
      slug: "hof",
      name: "חוף",
      tag: "מיטת שיזוף",
      tagline: "שכיבה אחת מול הבריכה",
      cover: loungerA,
      dimensions: "200 × 75 ס״מ",
      materials: ["אלומיניום", "בד Sunbrella"],
    },
    {
      slug: "tzel",
      name: "צל",
      tag: "מיטת שיזוף",
      tagline: "רחבה מספיק לשניים",
      cover: loungerB,
      dimensions: "200 × 120 ס״מ",
      materials: ["אלומיניום", "בד Sunbrella"],
    },
    {
      slug: "ruach",
      name: "רוח",
      tag: "נדנדה",
      tagline: "תלויה מקשת אחת נקייה",
      cover: swingA,
      dimensions: "גובה 210 ס״מ",
      materials: ["אלומיניום", "חבל ימי"],
    },
    {
      slug: "gal",
      name: "גל",
      tag: "נדנדה",
      tagline: "הפינה שהילדים תופסים ראשונים",
      cover: swingB,
      dimensions: "גובה 200 ס״מ",
      materials: ["אלומיניום", "חבל ימי"],
    },
  ],
};

export const demoProducts: DBProduct[] = Object.entries(seeds).flatMap(
  ([collectionId, items]) =>
    items.map((s) => ({
      id: `demo-${s.slug}`,
      collection_id: collectionId,
      slug: s.slug,
      name: s.name,
      tag: s.tag,
      tagline: s.tagline,
      description: [
        `${s.name} תוכנן לתנאי החוץ של ישראל: שמש ישירה, מלח, גשם ושימוש יומיומי. השלד באלומיניום בציפוי אבקה, והריפוד בבדי חוץ שלא דוהים.`,
        "כל פריט מיוצר בהתאמה אישית, כך שהמידות, הגוונים והקומפוזיציה נקבעים לפי המרחב שלכם.",
      ],
      highlights: [
        { title: "ייצור בהתאמה אישית", desc: "מידות וגוונים לפי המרחב." },
        { title: "עמידות חוץ מלאה", desc: "שמש, מלח וגשם, בלי לדהות." },
        { title: "תחזוקה מינימלית", desc: "ניגוב במים וסבון עדין." },
      ],
      materials: s.materials,
      dimensions: s.dimensions,
      // The placeholder catalogue is deliberately unpriced, like the real one.
      price: null,
      price_note: null,
      cover_url: s.cover,
      gallery: [s.cover],
    }))
);
