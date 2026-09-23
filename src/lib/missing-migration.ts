/**
 * "That table or column is not there yet."
 *
 * The code ships before the SQL does, so there is always a window where the
 * admin is asking for something the database has not got. Postgres and
 * PostgREST both say so, in four different ways, and none of them means
 * anything to the person reading the screen:
 *
 *   PGRST205  the table is not in PostgREST's schema cache
 *   PGRST204  the column is not in it either
 *   42P01     undefined_table
 *   42703     undefined_column
 *
 * Every one of those is the same fact — a migration has not been run — and it
 * is worth saying in those words rather than letting a red toast flash "the
 * save failed" and disappear. That is what happened with the materials screen:
 * the owner pressed "new material", saw a failure for half a second, and had
 * no way to find out that one script was all that stood in the way.
 */
export type SupabaseErrorish = { code?: string | null; message?: string | null } | null | undefined;

const CODES = new Set(["PGRST205", "PGRST204", "42P01", "42703"]);

export function isMissingSchema(error: SupabaseErrorish): boolean {
  if (!error) return false;
  if (error.code && CODES.has(error.code)) return true;
  const message = error.message?.toLowerCase() ?? "";
  return (
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("could not find the")
  );
}

/** The file the owner has to run, named where the screens can show it. */
export const MATERIALS_MIGRATION = "20260917120000_materials_and_sizes.sql";
