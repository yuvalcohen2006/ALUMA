import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Every admin screen has to change something a visitor can see.
 *
 * Three of them did not. The magazine published articles nothing linked to,
 * the settings screen saved a phone number nothing read, and six editable
 * texts had no component asking for them. All three failed the same way:
 * the save succeeded, the toast said "נשמר", and the site did not move.
 *
 * This walks the source rather than a list someone has to remember to update,
 * so a new admin screen for a table no public page reads fails here.
 */

const ROOT = process.cwd();

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) out.push(path);
  }
  return out;
}

const isAdmin = (f: string) => f.includes("/admin/");

/** Tables a file writes to, by the call that follows `.from("x")`. */
function tablesWritten(src: string): string[] {
  return [
    ...src.matchAll(/\.from\("(\w+)"\)[\s\S]{0,200}?\.(insert|update|upsert|delete)\(/g),
  ].map((m) => m[1]);
}

/** Tables a file reads from. */
function tablesRead(src: string): string[] {
  return [...src.matchAll(/\.from\("(\w+)"\)[\s\S]{0,120}?\.select\(/g)].map((m) => m[1]);
}

/**
 * Tables that exist for the business, not the website. Nobody browsing the
 * site should be able to read an enquiry or another customer's order, so an
 * admin-only reader is the correct design for these — not an oversight.
 */
const BACK_OFFICE: Record<string, string> = {
  contact_leads: "enquiries from the contact form — private",
  questionnaire_responses: "consultation requests — private",
  customer_projects: "a customer's own order, shown to them in the club area",
  profiles: "customer accounts",
  user_roles: "who is an admin",
  admin_invitations: "staff invitations",
  product_favorites: "what a customer saved, shown to them in the club area",
  newsletter_subscribers: "the mailing list",
  page_views: "analytics",
  active_sessions: "analytics",
};

describe("admin screens", () => {
  const files = sourceFiles("src").map((f) => f.split("\\").join("/"));
  const written = new Set(
    files.filter(isAdmin).flatMap((f) => tablesWritten(readFileSync(join(ROOT, f), "utf8"))),
  );
  const readPublicly = new Set(
    files.filter((f) => !isAdmin(f)).flatMap((f) => tablesRead(readFileSync(join(ROOT, f), "utf8"))),
  );

  it("finds the admin screens at all", () => {
    // If the scan broke, everything below would pass vacuously.
    expect(written.size).toBeGreaterThan(5);
  });

  it("changes something a visitor can see", () => {
    const invisible = [...written].filter(
      (t) => !readPublicly.has(t) && !(t in BACK_OFFICE),
    );
    expect(invisible).toEqual([]);
  });

  /**
   * Read outside the admin, and safe there because an RLS policy limits the
   * rows to the signed-in caller's own. Anything NOT on this list that a
   * public file reads is a table someone can enumerate.
   */
  const SCOPED_BY_RLS: Record<string, string> = {
    customer_projects: "the club dashboard, own orders only",
    profiles: "the club dashboard, own profile only",
    user_roles: "useIsAdmin — 'Users view own roles', auth.uid() = user_id",
  };

  it("does not leave a back-office table readable by the public site", () => {
    const leaked = Object.keys(BACK_OFFICE).filter(
      (t) => readPublicly.has(t) && !(t in SCOPED_BY_RLS),
    );
    expect(leaked).toEqual([]);
  });
});
