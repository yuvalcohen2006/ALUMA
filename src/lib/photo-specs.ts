/**
 * What each photo on the site actually has to be.
 *
 * These are not round numbers someone liked — every one is read off the
 * component that displays the image. Where a single upload is shown in two
 * different shapes (a collection is both a tall tile and a wide banner), the
 * spec says so, because that is exactly the case where a perfectly good
 * photograph comes out looking cropped and wrong.
 */
export type PhotoSpec = {
  /** What this photo is, in the owner's words. */
  what: string;
  /** The shape the site crops to. */
  shape: string;
  /** The one size to aim for. Not a range — a range is a decision. */
  size: string;
  /** The one mistake this particular photo invites. */
  watchOut: string;
};

export const PHOTO_SPECS = {
  hero: {
    what: "התמונה הגדולה בדף הבית",
    shape: "לרוחב, בערך 16:9",
    size: "2400 × 1350",
    watchOut:
      "בטלפון האתר חותך אותה לגובה, אז מה שחשוב צריך להיות במרכז — לא בקצה הימני או השמאלי.",
  },
  collection: {
    what: "תמונת קולקציה",
    shape: "מרובעת או קצת לגובה",
    size: "1600 × 1600",
    watchOut:
      "אותה תמונה נחתכת לשתי צורות שונות מאוד. השאירו אוויר מסביב לרהיט, אחרת בפס הרחב הוא ייחתך.",
  },
  product: {
    what: "תמונת מוצר",
    shape: "מרובעת",
    size: "1600 × 1600",
    watchOut:
      "השאירו מרווח קטן מסביב לרהיט. האתר חותך את התמונה קצת אחרת בכל מקום, ורהיט שנוגע בקצה ייראה קטוע.",
  },
  finish: {
    what: "תמונה של מוצר בצבע מסוים",
    shape: "מרובעת, בדיוק כמו תמונת המוצר",
    size: "1600 × 1600",
    watchOut:
      "צלמו מאותה זווית ומאותו מרחק כמו התמונה הרגילה — אחרת הרהיט 'קופץ' כשמחליפים צבע.",
  },
  project: {
    what: "תמונת פרויקט",
    shape: "לרוחב, בערך 3:2",
    size: "2000 × 1333",
    watchOut: "תמונות מהטלפון לגובה ייחתכו כאן. עדיף לצלם לרוחב.",
  },
  article: {
    what: "תמונת כתבה",
    shape: "לרוחב, בערך 3:2",
    size: "1600 × 1067",
    watchOut: "טקסט בתוך התמונה לא ייקרא בטלפון. עדיף תמונה בלי כיתוב.",
  },
} as const satisfies Record<string, PhotoSpec>;

export type PhotoSpecKey = keyof typeof PHOTO_SPECS;

/** The limit the upload itself enforces, shared by every screen. */
export const MAX_UPLOAD_MB = 8;
