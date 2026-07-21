CREATE TABLE public.product_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  collection_slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

GRANT SELECT, INSERT, DELETE ON public.product_favorites TO authenticated;
GRANT ALL ON public.product_favorites TO service_role;

ALTER TABLE public.product_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own favorites" ON public.product_favorites
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own favorites" ON public.product_favorites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own favorites" ON public.product_favorites
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins view all favorites" ON public.product_favorites
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_product_favorites_user ON public.product_favorites(user_id);
CREATE INDEX idx_product_favorites_product ON public.product_favorites(product_id);