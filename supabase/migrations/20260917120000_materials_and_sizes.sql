-- Materials become things the owner creates, and products carry their sizes.
--
-- The four materials on the site (Sunbrella, aluminium, porcelain stoneware,
-- PolyStone) lived in src/data/materials.ts, so the admin had nowhere to add a
-- fifth and no way to correct a word in the four. They are seeded here with
-- their existing copy, and the site keeps its bundled photograph for each one
-- until a new photo is uploaded.
--
-- The site works with or without this script: useMaterials falls back to the
-- same four in code when the table is missing, and a product with no sizes and
-- no materials simply shows neither box.

create table if not exists public.site_materials (
  id uuid primary key default gen_random_uuid(),
  -- The anchor on /materials, and what a product links to.
  slug text not null unique,
  name text not null,
  name_en text,
  -- One line under the name.
  tagline text,
  -- The explanation. A blank line starts a new paragraph.
  body text,
  image_url text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_materials_published_order_idx
  on public.site_materials (published, sort_order);

alter table public.site_materials enable row level security;

grant select on public.site_materials to anon, authenticated;
grant insert, update, delete on public.site_materials to authenticated;

drop policy if exists "Public reads published materials" on public.site_materials;
create policy "Public reads published materials" on public.site_materials
  for select to anon, authenticated using (published = true);

drop policy if exists "Admins read all materials" on public.site_materials;
create policy "Admins read all materials" on public.site_materials
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins write materials" on public.site_materials;
create policy "Admins write materials" on public.site_materials
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ───────────────────────────────────────────────── the four already on the site
--
-- image_url is left null on purpose: the site falls back to the photograph
-- bundled with the code for these four slugs, so they look right the moment
-- this runs, and an upload in the admin takes over from then on.
--
-- The body is the material's long description, with its qualities as a closing
-- paragraph. The old per-material Q&A is not carried over; it is in the git
-- history if it is ever wanted back.
insert into public.site_materials (slug, name, name_en, tagline, body, sort_order)
values
  (
    'sunbrella',
    'בד Sunbrella',
    'Sunbrella fabric',
    'נוחות שלא נכנעת לשמש',
    'בדי Sunbrella הם תקן הזהב העולמי לבדי חוץ. נארגים מסיבים אקריליים שנצבעים בצבע מלא, כך שהצבע חלק מהסיב עצמו ולא נשטף, לא דוהה ולא מתעייף עם השנים.

המגע רך כמו בד פנים, אך מתחת לחזות העדינה מסתתרת עמידות בלתי מתפשרת לשמש הישראלית, לרסס מלח, לכלור ולמים. כתמים נשטפים בקלות, והבד שומר על מראהו המקורי גם אחרי עונות ארוכות בחוץ.

עמידות UV: צבע מלא בסיב, לא דוהה גם בשמש הישראלית. דוחה מים וכתמים בזכות ציפוי הידרופובי, עם עד 10 שנות אחריות יצרן בינלאומית.',
    10
  ),
  (
    'aluminum',
    'אלומיניום',
    'Aluminium',
    'שלד אדריכלי שלא חולה ולא חולד',
    'האלומיניום שלנו עובר ציפוי אבקה תרמי בתנור בטמפרטורה גבוהה, תהליך שיוצר שכבה אחידה, עמוקה ועמידה הרבה יותר מצבע רגיל. התוצאה: מסגרת שנשארת חלקה ומדויקת שנים, גם מול הים, הגשם והשמש.

המבנה קל משמעותית מברזל, אבל לא מתפשר על יציבות. הוא לא חולד, לא מתעקם ולא דורש תחזוקה, רק ניגוב מדי פעם. הקווים הנקיים מאפשרים לרהיט לדבר בשפה אדריכלית מינימליסטית ושקטה.

מתאים לחצרות, לגגות ולבתים מול הים, ומיוצר בשחור מאט, לבן, ברונזה וכל גוון RAL בהזמנה.',
    20
  ),
  (
    'granite-porcelain',
    'שיש גרניט פורצלן',
    'Porcelain stoneware',
    'כל לוח, יצירה בפני עצמה',
    'גרניט פורצלן הוא החומר היוקרתי ביותר למשטחי חוץ, קשה כאבן, עמיד בפני שריטות, חום, כתמים וקרינת UV. בניגוד לשיש טבעי, הוא לא סופג נוזלים ולא דורש איטום מחדש.

כל לוח נבחר בידנו ומעובד באמצעות חיתוך מדויק, ליטוש קצוות והתאמה אישית לכל שולחן. הטקסטורה והוורידים נשארים ייחודיים, אין שני לוחות זהים, וזה בדיוק היופי שבו.

כוסות חמות, יין ושמן זית לא משאירים סימן, והלוח לא משנה גוון בשמש.',
    30
  ),
  (
    'polystone',
    'PolyStone',
    'PolyStone',
    'פיסול בחומר מודרני, קל, עמיד ויוקרתי',
    'PolyStone הוא חומר מרוכב מתקדם המשלב שרף פולימרי עם אבקת אבן טבעית, מקבל מראה ומגע של אבן יוקרתית, אך במשקל נמוך משמעותית ובעמידות גבוהה לכל תנאי החוץ.

החומר מאפשר חופש עיצובי מלא: צורות פיסוליות, עיגולים מושלמים וקצוות חדים שלא ניתן להשיג באבן טבעית. גימור מאט אחיד, ללא תפרים, וגוונים אדריכליים שנשארים יציבים בשמש, בגשם וברסס מלח.

עד 70% קל יותר מבטון, לא סופג מים ולא דורש איטום חוזר.',
    40
  )
on conflict (slug) do nothing;

-- ───────────────────────────────────────────────── what a product is made of
--
-- material_ids: the materials ticked in the product form, in the order they
-- were ticked. The old free-text `materials` column stays where it is, unread
-- and empty on every row, rather than being dropped from under a running site.
--
-- The sizes are three plain numbers in centimetres rather than a list of
-- label-and-value rows. The owner asked for boxes to fill in, not a table to
-- build: a row that needs a name typed into it is a row that comes out as
-- "אורך" on one product and "אורך כולל" on the next. A blank is simply not
-- shown. The single free-text `dimensions` line from before still shows for
-- any product that has one and no numbers.
alter table public.site_collection_products
  add column if not exists material_ids jsonb not null default '[]'::jsonb;

alter table public.site_collection_products
  add column if not exists length_cm numeric;

alter table public.site_collection_products
  add column if not exists width_cm numeric;

alter table public.site_collection_products
  add column if not exists height_cm numeric;
