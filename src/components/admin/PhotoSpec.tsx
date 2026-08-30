import { ChevronDown, ImageIcon } from "lucide-react";
import { MAX_UPLOAD_MB, PHOTO_SPECS, type PhotoSpecKey } from "@/lib/photo-specs";

/**
 * What a photo on this screen has to be, before anyone uploads one.
 *
 * A `<details>` element rather than a modal or a tooltip: the headline numbers
 * are readable without opening it, it costs nothing to ignore on the tenth
 * visit, and it works with the keyboard and a screen reader without any code
 * from us.
 */
const PhotoSpec = ({ spec }: { spec: PhotoSpecKey }) => {
  const s = PHOTO_SPECS[spec];

  return (
    <details className="group mb-6 rounded-sm border border-border bg-card" dir="rtl">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="flex-1 text-sm text-foreground">
          <span className="font-medium">{s.what}:</span>{" "}
          <span className="text-muted-foreground">
            {s.shape}, לפחות {s.minSize}
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div className="space-y-4 border-t border-border p-4 text-sm leading-relaxed">
        <p className="text-muted-foreground">
          <span className="text-foreground">איפה זה מופיע: </span>
          {s.usedFor}
        </p>

        <p className="text-muted-foreground">
          <span className="text-foreground">שימו לב: </span>
          {s.watchOut}
        </p>

        <div className="rounded-sm bg-secondary/60 p-3.5">
          <p className="font-medium text-foreground">איך בודקים גודל של תמונה</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>
              <span className="text-foreground">בווינדוס:</span> קליק ימני על הקובץ ←
              מאפיינים (Properties) ← לשונית פרטים (Details). מחפשים "ממדים".
            </li>
            <li>
              <span className="text-foreground">במאק:</span> לוחצים על הקובץ פעם אחת ואז
              Cmd+I. המידות מופיעות תחת "Dimensions".
            </li>
            <li>
              <span className="text-foreground">בטלפון:</span> בגלריה, פרטי התמונה (i)
              מראים את הרזולוציה.
            </li>
          </ul>
        </div>

        <ul className="space-y-1 text-muted-foreground">
          <li>
            <span className="text-foreground">גודל קובץ:</span> עד {MAX_UPLOAD_MB}MB.
            תמונה גדולה מדי פשוט לא תעלה.
          </li>
          <li>
            <span className="text-foreground">פורמט:</span> JPG או PNG. אם המצלמה שמרה
            HEIC, המירו קודם.
          </li>
          <li>
            <span className="text-foreground">קטן מדי זה לא הפיך:</span> תמונה של 600
            פיקסלים לא תיראה טוב כשמותחים אותה. עדיף גדולה מדי מקטנה מדי.
          </li>
        </ul>
      </div>
    </details>
  );
};

export default PhotoSpec;
