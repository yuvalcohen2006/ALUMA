-- Create the storage buckets the admin CMS uploads into.
--
-- These previously existed only because someone made them by hand in the
-- dashboard — the RLS policies on storage.objects were migrated, but the
-- buckets they referenced were not, so a fresh project got the rules without
-- the shelves. Declaring them here means `db push` alone is now enough to stand
-- up a working project.
--
-- public = true: these hold product photography that every visitor must be able
-- to load. Read access is meant to be open. WRITE access stays admin-only and is
-- enforced by the policies on storage.objects (see 20260624101945), not by the
-- bucket's public flag.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('site-projects',    'site-projects',    true),
  ('site-hero',        'site-hero',        true),
  ('blog-images',      'blog-images',      true),
  ('site-collections', 'site-collections', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Public buckets still need an explicit SELECT policy for anonymous visitors;
-- the admin policies migrated earlier only cover the `authenticated` role.
DROP POLICY IF EXISTS "public assets are readable" ON storage.objects;
CREATE POLICY "public assets are readable"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = ANY (ARRAY['site-projects', 'site-hero', 'blog-images', 'site-collections'])
);
