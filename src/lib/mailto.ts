/**
 * A `mailto:` link with the message already written.
 *
 * A bare `mailto:address` opens an empty compose window in every client, which
 * reads as "the link is broken" — the person has to work out what to say and
 * who they are. Subject and body cost nothing and make the click do something.
 *
 * `encodeURIComponent` rather than URLSearchParams: the latter encodes spaces
 * as "+", which several desktop mail clients render literally.
 */
export function mailtoLink(email: string, subject?: string, body?: string): string {
  const parts: string[] = [];
  if (subject?.trim()) parts.push(`subject=${encodeURIComponent(subject)}`);
  if (body?.trim()) parts.push(`body=${encodeURIComponent(body)}`);
  return parts.length ? `mailto:${email}?${parts.join("&")}` : `mailto:${email}`;
}
