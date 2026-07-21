
DROP POLICY IF EXISTS "page_views public insert" ON public.page_views;

CREATE OR REPLACE FUNCTION public.record_page_view(
  _session_id text,
  _path text,
  _referrer text,
  _user_agent text,
  _project_slug text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _session_id IS NULL OR length(_session_id) < 8 OR length(_session_id) > 128 THEN
    RETURN;
  END IF;
  IF _path IS NULL OR length(_path) > 500 THEN
    RETURN;
  END IF;
  INSERT INTO public.page_views (session_id, path, referrer, user_agent, project_slug)
  VALUES (
    _session_id,
    _path,
    left(coalesce(_referrer,''), 500),
    left(coalesce(_user_agent,''), 300),
    left(coalesce(_project_slug,''), 200)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_page_view(text, text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.record_page_view(text, text, text, text, text) TO anon, authenticated;
