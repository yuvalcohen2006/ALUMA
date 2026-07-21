
CREATE TABLE public.admin_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_invitations TO authenticated;
GRANT ALL ON public.admin_invitations TO service_role;

ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage invitations"
ON public.admin_invitations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_invited boolean := false;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;

  IF new.email IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.admin_invitations
      WHERE lower(email) = lower(new.email) AND status = 'pending'
    ) INTO is_invited;
  END IF;

  IF is_invited THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin')
    ON CONFLICT DO NOTHING;
    UPDATE public.admin_invitations
      SET status = 'accepted', accepted_at = now()
      WHERE lower(email) = lower(new.email);
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'customer')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN new;
END;
$$;
