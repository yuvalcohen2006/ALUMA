/**
 * One address for the site.
 *
 * Vercel keeps handing out `*.vercel.app` URLs for every deployment, and
 * Supabase's Site URL still points at one of them — so a Google sign-in that
 * starts on alumaoutdoor.com can finish on aluma-three.vercel.app, showing the
 * same site at an address nobody should be on, with the session attached to
 * the wrong host. Search engines would happily index it twice, too.
 *
 * Rather than depend on a dashboard setting being right, the app carries
 * itself home.
 */

/** Hosts that are the site proper and must never be redirected away from. */
const isCanonical = (host: string, canonical: string) =>
  host === canonical || host === `www.${canonical}`;

/** A Vercel-issued preview address — the label, not merely the substring. */
const isPreview = (host: string) => host === "vercel.app" || host.endsWith(".vercel.app");

/**
 * Where this URL should go instead, or null if it is already home.
 *
 * Path, query AND hash are carried across. The hash is the important one:
 * Supabase returns the session tokens in it, so dropping it would destroy the
 * very sign-in that caused the redirect.
 */
export function canonicalRedirect(currentUrl: string, canonicalHost: string): string | null {
  if (!canonicalHost) return null;

  let url: URL;
  try {
    url = new URL(currentUrl);
  } catch {
    return null;
  }

  if (isCanonical(url.hostname, canonicalHost)) return null;
  if (!isPreview(url.hostname)) return null;

  return `https://${canonicalHost}${url.pathname}${url.search}${url.hash}`;
}
