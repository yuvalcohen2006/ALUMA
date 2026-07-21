
-- Remove overly permissive UPDATE policy on active_sessions
DROP POLICY IF EXISTS "active_sessions public update" ON public.active_sessions;
DROP POLICY IF EXISTS "active_sessions public upsert" ON public.active_sessions;

-- Server-side controlled heartbeat: bypasses RLS via SECURITY DEFINER,
-- callable by anyone but only touches the row for the provided session_id.
CREATE OR REPLACE FUNCTION public.record_heartbeat(_session_id text, _path text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _session_id IS NULL OR length(_session_id) < 8 OR length(_session_id) > 128 THEN
    RETURN;
  END IF;
  INSERT INTO public.active_sessions (session_id, path, last_seen)
  VALUES (_session_id, left(coalesce(_path,''), 300), now())
  ON CONFLICT (session_id)
  DO UPDATE SET path = EXCLUDED.path, last_seen = now();
END;
$$;

REVOKE ALL ON FUNCTION public.record_heartbeat(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.record_heartbeat(text, text) TO anon, authenticated;

-- Ensure session_id has a unique constraint for the upsert above
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'active_sessions_session_id_key'
  ) THEN
    ALTER TABLE public.active_sessions
      ADD CONSTRAINT active_sessions_session_id_key UNIQUE (session_id);
  END IF;
END $$;
