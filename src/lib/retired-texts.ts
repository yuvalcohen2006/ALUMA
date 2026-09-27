/**
 * `site_texts` rows the site no longer reads.
 *
 * The Q&A title is fixed at the owner's request ("שאלות ותשובות", nothing
 * else) and its subtitle is gone, so these rows are left in the table but kept
 * off the admin's texts screen: a field that changes nothing when saved is
 * worse than no field.
 */
export const RETIRED_SITE_TEXTS: ReadonlySet<string> = new Set(["faq.title", "faq.subtitle"]);
