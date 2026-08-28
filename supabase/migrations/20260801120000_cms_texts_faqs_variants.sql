-- The CMS layer the client asked for: editable copy, editable questions, and
-- product colour variants with their own photographs.
--
-- All three follow the same shape as the existing site_* tables: the public
-- reads only what is published, writes are admin-only via has_role().

-- ---------------------------------------------------------------------------
-- 1. site_texts - any piece of copy the client should be able to change
-- ---------------------------------------------------------------------------
-- Keyed by a stable dotted id ("home.statement.body") rather than by page and
-- field columns, so adding an editable string later is an insert, never a
-- migration. The code keeps its own copy as a fallback: if a row is missing or
-- blank the component renders what it ships with, so a half-filled table can
-- never blank out the site.
create table if not exists public.site_texts (
  key text primary key,
  value text not null default '',
  label text not null,              -- human name shown in the admin list
  hint text,                        -- where it appears, for whoever is editing
  multiline boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.site_texts enable row level security;
grant select on public.site_texts to anon, authenticated;
grant insert, update, delete on public.site_texts to authenticated;

drop policy if exists "site_texts public read" on public.site_texts;
create policy "site_texts public read" on public.site_texts
  for select to anon, authenticated using (true);

drop policy if exists "site_texts admin write" on public.site_texts;
create policy "site_texts admin write" on public.site_texts
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 2. site_faqs - the Q&A, editable, with the price question gone
-- ---------------------------------------------------------------------------
create table if not exists public.site_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'general',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_faqs_order_idx on public.site_faqs (published, sort_order);

alter table public.site_faqs enable row level security;
grant select on public.site_faqs to anon, authenticated;
grant insert, update, delete on public.site_faqs to authenticated;

drop policy if exists "site_faqs public read" on public.site_faqs;
create policy "site_faqs public read" on public.site_faqs
  for select to anon, authenticated using (published = true);

drop policy if exists "site_faqs admin all" on public.site_faqs;
create policy "site_faqs admin all" on public.site_faqs
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 3. product_variants - a colour, a swatch, and its own photograph
-- ---------------------------------------------------------------------------
-- The feature the client described: different photos of the furniture that
-- toggle when the visitor changes colour. Selecting a swatch on the product
-- page swaps image_url, so one product can carry as many finishes as it
-- actually comes in.
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.site_collection_products(id) on delete cascade,
  name text not null,                       -- the finish, in Hebrew
  swatch text,                              -- hex, for the dot when no thumbnail exists
  image_url text,                           -- the product shown in this finish
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_variants_product_idx
  on public.product_variants (product_id, sort_order);

alter table public.product_variants enable row level security;
grant select on public.product_variants to anon, authenticated;
grant insert, update, delete on public.product_variants to authenticated;

drop policy if exists "product_variants public read" on public.product_variants;
create policy "product_variants public read" on public.product_variants
  for select to anon, authenticated using (true);

drop policy if exists "product_variants admin write" on public.product_variants;
create policy "product_variants admin write" on public.product_variants
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 4. Seed the editable copy with exactly what the code ships today
-- ---------------------------------------------------------------------------
-- Seeding with the live wording means the first visit to the admin shows the
-- real site, not a screen of empty boxes.
insert into public.site_texts (key, value, label, hint, multiline, sort_order) values
  ('home.statement.lead', 'אלומה נולדה מתוך חיבור בין חומר לאור.',
   'דף הבית - משפט פתיחה', 'המשפט הגדול מתחת לתמונה הראשית', false, 10),
  ('home.statement.body', 'אנחנו מתכננים ומייצרים ריהוט חוץ בהתאמה אישית - שלדת אלומיניום, בדי Sunbrella ומשטחי אבן שנבחרו כדי לעמוד בשמש, במלח ובגשם של ישראל. כל פריט נמדד למרחב שהוא נכנס אליו, ונשאר בחוץ כל השנה.',
   'דף הבית - פסקת פתיחה', 'הפסקה מתחת למשפט הפתיחה', true, 20),
  ('home.collections.title', 'קולקציות נבחרות', 'דף הבית - כותרת קולקציות', null, false, 30),
  ('home.products.title', 'מוצרים נבחרים', 'דף הבית - כותרת מוצרים', null, false, 40),
  ('home.projects.title', 'פרויקטים', 'דף הבית - כותרת פרויקטים', null, false, 50),
  ('collections.title', 'קולקציות', 'עמוד קולקציות - כותרת', null, false, 60),
  ('collections.subtitle', 'כל פריט מיוצר בהזמנה אישית. בלי מחירון, כי אין אצלנו שני פרויקטים זהים.',
   'עמוד קולקציות - תיאור', null, true, 70),
  ('materials.title', 'החומרים', 'עמוד חומרים - כותרת', null, false, 80),
  ('materials.subtitle', 'ההחלטה הראשונה בכל פריט היא לא הצורה, אלא החומר. אלה הארבעה שאנחנו בונים איתם, ומה כל אחד מהם עושה אחרי כמה שנים בחוץ.',
   'עמוד חומרים - תיאור', null, true, 90),
  ('faq.title', 'שאלות? תשובות.', 'שאלות ותשובות - כותרת', null, false, 100),
  ('faq.subtitle', 'כל מה שאנחנו נשאלים לפני שמזמינים, ומה שכדאי לדעת אחרי.',
   'שאלות ותשובות - תיאור', null, true, 110),
  ('club.title', 'הצטרפו למועדון', 'מועדון - כותרת', 'הכרטיס בתחתית דף הבית', false, 120),
  ('club.subtitle', 'קולקציות חדשות לפני כולם, וטיפים לעיצוב החוץ, ישירות לתיבה.',
   'מועדון - תיאור', null, true, 130)
on conflict (key) do nothing;

-- The questions the site ships with, minus the price one the client asked to
-- remove.
insert into public.site_faqs (question, answer, category, sort_order) values
  ('כמה זמן לוקח לקבל את ההזמנה?',
   'זמן האספקה הממוצע נע בין 5 ל-10 שבועות, בהתאם לזמינות הקולקציה ולהיקף ההזמנה. כבר במעמד הרכישה תקבלו הערכת זמן מסודרת, ואנו נדאג לעדכן אתכם לאורך כל התהליך.',
   'רכישה ואספקה', 10),
  ('האם יש הובלה והרכבה?',
   'הריהוט מסופק לבית הלקוח בתיאום מראש, ומורכב על ידי צוות מקצועי ומנוסה. אנו מקפידים על הובלה בטוחה, הרכבה מדויקת ופינוי האריזות.',
   'רכישה ואספקה', 20),
  ('האם הריהוט עמיד לתנאי חוץ?',
   'ריהוט החוץ שלנו מיוצר מחומרים שנבחרו במיוחד לתנאי האקלים בישראל: שלדת אלומיניום איכותית בצביעה בתנור, בדי Sunbrella עמידים בפני מים וקרינת UV, ומשטחי שיש גרניט פורצלן. כל פריט מיועד לשימוש חיצוני בכל עונות השנה.',
   'חומרים ועמידות', 30),
  ('מה איכות החומרים?',
   'כל קולקציה נבחרת בקפידה מתוך דגש על איכות, נוחות ועמידות. השילוב בין שלדת האלומיניום, בדי הפרימיום ומשטחי הגרניט פורצלן יוצר ריהוט חוץ יוקרתי המיועד לשנים רבות של שימוש ואירוח.',
   'חומרים ועמידות', 40),
  ('איך מתחזקים את הריהוט?',
   'ריהוט החוץ שלנו תוכנן לדרוש תחזוקה מינימלית. ניקוי תקופתי של השלדה, הבדים והמשטחים במים ובחומרי ניקוי עדינים ישמור על מראה נקי לאורך שנים.',
   'חומרים ועמידות', 50),
  ('מה כוללת האחריות?',
   'אנו מעניקים אחריות על ריהוט החוץ בהתאם לסוג המוצר והרכיבים ממנו הוא מיוצר. צוות השירות שלנו זמין לכל שאלה גם לאחר האספקה.',
   'אחריות ושירות', 60),
  ('האם יש אולם תצוגה?',
   'אולם התצוגה שלנו, ברחוב התמר 78 ביציץ, פתוח בתיאום מראש. במקום תוכלו להתרשם מהקולקציות, להרגיש את החומרים מקרוב ולקבל ייעוץ מקצועי.',
   'אחריות ושירות', 70)
on conflict do nothing;
