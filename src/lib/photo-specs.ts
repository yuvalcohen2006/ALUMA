/**
 * What each photo on the site actually has to be.
 *
 * These are read off the components that display the image, not chosen. That
 * mattered more than expected: four of the six specs used to be wrong. The
 * collection spec asked for a square and warned about a wide banner that had
 * already been deleted, while the two places a collection image is really shown
 * are 3:4 and 4:5. The product spec asked for a square and the site crops
 * product covers at three different ratios. So a person following the guide
 * exactly could still get a cropped result and have no idea why.
 *
 * `shownAt` is the honest part. Almost every image on this site appears at more
 * than one shape, which a single crop cannot satisfy — so instead of pretending
 * otherwise, the crop dialog previews every shape the photo will really be
 * seen in, and the owner can zoom out until the subject survives all of them.
 */
export type PhotoSpec = {
  /** What this photo is, in the owner's words. */
  what: string;
  /** The shape the crop window uses — the one the site leans on most. */
  shape: string;
  /** The one size to aim for. Not a range — a range is a decision. */
  size: string;
  /** The one mistake this particular photo invites. */
  watchOut: string;
  /** Output pixels. The crop is baked to exactly this. */
  out: { w: number; h: number };
  /** Every shape the site really shows this photo in, for the live preview. */
  shownAt: { label: string; ratio: number }[];
};

export const PHOTO_SPECS = {
  hero: {
    what: "התמונה הגדולה בדף הבית",
    shape: "לרוחב, 16:9",
    size: "2400 × 1350",
    watchOut:
      "בטלפון האתר חותך רצועה צרה וגבוהה מהחלק העליון. בדקו את התצוגה של הטלפון לפני שמירה — מה שחשוב חייב להיות למעלה ובמרכז.",
    out: { w: 2400, h: 1350 },
    // Hero.tsx renders `w-full h-[125%] object-cover object-top` inside a
    // min-h-dvh section, so the box is viewport-width by 1.25 viewport-height.
    // There is no fixed ratio at all — these are the two real devices.
    shownAt: [
      { label: "מחשב", ratio: 1.28 },
      { label: "טלפון", ratio: 0.37 },
    ],
  },
  collection: {
    what: "תמונת קולקציה",
    shape: "לגובה, 3:4",
    size: "1500 × 2000",
    watchOut: "השאירו אוויר מעל ומתחת לרהיט — בדף הקטלוג התמונה נחתכת קצת יותר נמוכה.",
    out: { w: 1500, h: 2000 },
    shownAt: [
      { label: "דף הבית", ratio: 3 / 4 },
      { label: "קטלוג", ratio: 4 / 5 },
    ],
  },
  product: {
    what: "תמונת מוצר",
    shape: "מרובעת",
    size: "1600 × 1600",
    watchOut:
      "אותה תמונה נחתכת בשלוש צורות שונות. השאירו מרווח מסביב לרהיט, אחרת הוא ייחתך באחת מהן.",
    out: { w: 1600, h: 1600 },
    shownAt: [
      { label: "דף הקולקציה", ratio: 1 },
      { label: "דף הבית", ratio: 1 },
      { label: "מוצרים דומים", ratio: 4 / 3 },
    ],
  },
  finish: {
    what: "תמונה של מוצר בצבע מסוים",
    shape: "מרובעת, בדיוק כמו תמונת המוצר",
    size: "1600 × 1600",
    watchOut:
      "צלמו מאותה זווית ומאותו מרחק כמו התמונה הרגילה, וחתכו אותה באותו אופן — אחרת הרהיט 'קופץ' כשמחליפים צבע.",
    out: { w: 1600, h: 1600 },
    shownAt: [{ label: "בדף המוצר", ratio: 1 }],
  },
  project: {
    what: "תמונת פרויקט",
    shape: "לרוחב, 3:2",
    size: "2000 × 1333",
    watchOut: "בדף הפרויקטים התמונה נחתכת מעט מהצדדים. אל תצמידו את הרהיט לקצה.",
    out: { w: 2000, h: 1333 },
    shownAt: [
      { label: "דף הבית", ratio: 3 / 2 },
      { label: "דף הפרויקטים", ratio: 4 / 3 },
    ],
  },
  article: {
    what: "תמונת כתבה",
    shape: "לרוחב, 3:2",
    size: "1600 × 1067",
    watchOut: "טקסט בתוך התמונה לא ייקרא בטלפון. עדיף תמונה בלי כיתוב.",
    out: { w: 1600, h: 1067 },
    shownAt: [{ label: "ביומן", ratio: 3 / 2 }],
  },
} as const satisfies Record<string, PhotoSpec>;

export type PhotoSpecKey = keyof typeof PHOTO_SPECS;

/**
 * The limit the upload enforces.
 *
 * It used to be printed above every upload box and enforced nowhere: no size
 * check in any handler, no file_size_limit on any bucket, no [storage] block in
 * config.toml. A 40MB photo uploaded fine and the number above the box was
 * decoration.
 */
export const MAX_UPLOAD_MB = 8;

/**
 * What the file input accepts, and what the handler re-checks.
 *
 * Every input used to say `image/*`, which matches image/heic — so a photo
 * straight off an iPhone uploaded successfully, stored with a .heic extension,
 * and then rendered as a broken image in every browser except Safari. It also
 * matched image/svg+xml, which is a script-bearing format going into a public
 * bucket.
 *
 * The crop step re-encodes everything to JPEG anyway, so by the time a file
 * reaches storage it is a JPEG whatever it started as — but the input should
 * still refuse what the browser cannot decode in the first place.
 */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(",");
