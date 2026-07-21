import salonEucalyptus from "@/assets/collections/salon-eucalyptus.jpg";
import salonMarina from "@/assets/collections/salon-marina.jpg";
import salonSahara from "@/assets/collections/salon-sahara.jpg";
import salonMonolith from "@/assets/collections/salon-monolith.jpg";
import tableTerrazzo from "@/assets/collections/table-terrazzo.jpg";
import tableGranite from "@/assets/collections/table-granite.jpg";

export interface BeforeAfterItem {
  id: string;
  title: string;
  location: string;
  tag: string;
  description: string;
  /** Real before photo URL — when available */
  before: string;
  /** Final after photo URL */
  after: string;
}

/**
 * NOTE: Until real "before" photos are uploaded, the gallery uses
 * alternative shots from the same project as a placeholder. Replace
 * the `before` URLs with the actual pre-renovation photos when ready.
 */
export const beforeAfterItems: BeforeAfterItem[] = [
  {
    id: "kfar-shmaryahu-terrace",
    title: "מרפסת בכפר שמריהו",
    location: "כפר שמריהו",
    tag: "מרפסת פנורמית",
    description:
      "מרפסת ריקה ולא מנוצלת הפכה לסלון חוץ פנורמי עם פינת ארוחות לעשרה סועדים.",
    before: tableTerrazzo,
    after: salonMonolith,
  },
  {
    id: "tel-aviv-rooftop",
    title: "גג בתל אביב",
    location: "תל אביב",
    tag: "פנטהאוז",
    description:
      "גג חשוף עם בטון גלוי קיבל פלטה בהירה ים תיכונית עם סלון מודולרי ושולחן טרצו.",
    before: salonSahara,
    after: salonMarina,
  },
  {
    id: "herzliya-pool",
    title: "חצר בהרצליה פיתוח",
    location: "הרצליה פיתוח",
    tag: "חצר עם בריכה",
    description:
      "חצר משפחתית סטנדרטית הפכה לשלושה אזורי שימוש מובחנים בשפה ויזואלית אחת.",
    before: tableGranite,
    after: salonEucalyptus,
  },
  {
    id: "caesarea-villa",
    title: "וילה בקיסריה",
    location: "קיסריה",
    tag: "פינת אירוח",
    description:
      "פינה מול הים, עם רהיטים ישנים — הפכה לפינת אירוח אינטימית במונוליט גרפיט.",
    before: salonMarina,
    after: tableGranite,
  },
];
