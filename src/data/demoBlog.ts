import terraceA from "@/assets/blog/gen/terrace-a.webp";
import terraceB from "@/assets/blog/gen/terrace-b.webp";
import fabricA from "@/assets/blog/gen/fabric-a.webp";
import fabricB from "@/assets/blog/gen/fabric-b.webp";
import balconyA from "@/assets/blog/gen/balcony-a.webp";
import balconyB from "@/assets/blog/gen/balcony-b.webp";

/**
 * Placeholder magazine content — NOT real Aluma articles.
 *
 * The blog table is empty, so the magazine page had nothing to lay out and no
 * cover images to show. These six exist purely so the page can be designed
 * against realistic content. Used in development only; real rows always win,
 * and production shows the honest empty state.
 *
 * Delete this file and its import in src/pages/Journal.tsx to remove it.
 */
export type DemoPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tag: string | null;
  read_minutes: number | null;
  published_at: string | null;
};

export const demoPosts: DemoPost[] = [
  {
    id: "demo-post-1",
    slug: "mirpeset-shemetafkedet-kmo-salon",
    title: "מרפסת שמתפקדת כמו סלון",
    excerpt:
      "ההבדל בין מרפסת שיושבים בה פעם בחודש לבין מרחב שהמשפחה נמצאת בו כל ערב הוא כמעט תמיד תכנוני, לא תקציבי. איך מחלקים את השטח, איפה ממקמים את הישיבה, ולמה כדאי להתחיל דווקא מכיוון השמש.",
    cover_image_url: terraceA,
    tag: "תכנון",
    read_minutes: 6,
    published_at: "2026-07-14",
  },
  {
    id: "demo-post-2",
    slug: "badei-chutz-tov-mul-metzuyan",
    title: "בדי חוץ: מה באמת מבדיל בין טוב למצוין",
    excerpt:
      "שני בדים יכולים להיראות זהים ברגע הקנייה ולהיפרד לחלוטין אחרי קיץ אחד. ההבדל נמצא בשיטת הצביעה של הסיב, ולא במחיר או במגע.",
    cover_image_url: fabricA,
    tag: "חומרים",
    read_minutes: 5,
    published_at: "2026-07-02",
  },
  {
    id: "demo-post-3",
    slug: "mirpeset-ktana-tichnun-gadol",
    title: "מרפסת קטנה, תכנון גדול",
    excerpt:
      "שנים־עשר מטר אינם מגבלה, הם בריף. כשהשטח מצומצם כל פריט צריך להצדיק את מקומו, וזה בדיוק מה שהופך את התוצאה לנקייה יותר ממרפסות גדולות פי שלושה.",
    cover_image_url: balconyA,
    tag: "תכנון",
    read_minutes: 4,
    published_at: "2026-06-21",
  },
  {
    id: "demo-post-4",
    slug: "or-vetzel-tichnun-hatzlala",
    title: "אור וצל: לתכנן מרחב שאפשר לשבת בו גם באוגוסט",
    excerpt:
      "הצללה טובה נמדדת בשעות שבהן המרחב שמיש, לא במטרים שהיא מכסה. מה לבדוק לפני שבוחרים פתרון, ואיך זה משתנה בין חזית מערבית לדרומית.",
    cover_image_url: terraceB,
    tag: "תכנון",
    read_minutes: 7,
    published_at: "2026-06-09",
  },
  {
    id: "demo-post-5",
    slug: "chomarim-shenisharim-yafim",
    title: "החומרים שנשארים יפים אחרי חמש שנים בחוץ",
    excerpt:
      "שמש ישירה, רסס מלח וגשם הם מבחן שלא כל חומר עובר. סקירה קצרה של מה שמחזיק מעמד בתנאי החוץ של ישראל, ולמה.",
    cover_image_url: fabricB,
    tag: "חומרים",
    read_minutes: 6,
    published_at: "2026-05-28",
  },
  {
    id: "demo-post-6",
    slug: "migag-ironi-lemerchav-megurim",
    title: "מגג עירוני למרחב מגורים",
    excerpt:
      "גגות הם המרחב הכי מבוזבז בבניין העירוני. מה צריך לבדוק לפני שמתחילים, ואיך בונים שם מרחב שמרגיש כמו המשך של הבית ולא כמו תוספת.",
    cover_image_url: balconyB,
    tag: "פרויקטים",
    read_minutes: 5,
    published_at: "2026-05-15",
  },
];
