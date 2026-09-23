import { MATERIALS_MIGRATION } from "@/lib/missing-migration";

/**
 * What to do when a screen needs a script nobody has run.
 *
 * On screen and staying there, rather than a toast: the owner pressed "new
 * material", a red line said the save failed, and it was gone before it could
 * be read — leaving a screen that simply did not work and no way to find out
 * why. This says the reason and the five clicks that fix it.
 */
const MigrationNotice = ({ what }: { what: string }) => (
  <div className="rounded-sm border border-warning/40 bg-warning/5 p-6">
    <p className="text-base font-medium text-foreground">{what} עדיין לא מופעל במסד הנתונים.</p>
    <p className="mt-2 text-base text-foreground">צריך להריץ פעם אחת סקריפט קצר:</p>
    <ol className="mt-4 list-decimal space-y-2 pe-5 text-base text-foreground">
      <li>
        פתחו את{" "}
        <a
          className="underline"
          href="https://supabase.com/dashboard/project/jzqayfllojeqivwbbuyf/sql/new"
          target="_blank"
          rel="noreferrer"
        >
          עורך ה-SQL של Supabase
        </a>
      </li>
      <li>
        פתחו בתיקיית הפרויקט את הקובץ{" "}
        <code dir="ltr" className="rounded bg-secondary px-1.5 py-0.5 text-base">
          supabase/migrations/{MATERIALS_MIGRATION}
        </code>
      </li>
      <li>העתיקו את כל תוכן הקובץ והדביקו בתיבה</li>
      <li>לחצו Run</li>
      <li>רעננו את הדף הזה</li>
    </ol>
  </div>
);

export default MigrationNotice;
