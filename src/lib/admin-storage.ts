import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads an image and returns its permanent public URL.
 *
 * These buckets are public on purpose — the files are product photography every
 * visitor has to be able to load. Write access is still admin-only, enforced by
 * row-level security on storage.objects rather than by URL secrecy.
 *
 * Public URLs rather than signed ones matters for two reasons. A signed URL
 * expires: the previous implementation issued one-year links, so every photo on
 * the site would have broken exactly a year after it was uploaded. And a stable
 * URL can actually be cached by the CDN instead of being re-fetched from origin
 * on every request, which is most of the egress bill on an image-heavy site.
 */
export async function uploadFile(
  bucket: string,
  file: File
): Promise<{ path: string; url: string }> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    // Long cache: the filename carries a timestamp and a random suffix, so a
    // given path's contents never change — a re-upload is always a new path.
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

/**
 * Resolves a stored path back to its public URL.
 *
 * Kept for call sites holding a bare path. Public URLs never expire, so unlike
 * the signed-URL version this needs no network round-trip and cannot fail —
 * but it stays `async` so existing `await` call sites keep working.
 */
export async function refreshUrl(bucket: string, path: string): Promise<string> {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
