-- Home page pass: Hebrew product names, a stock count, and three new titles.
--
-- Three unrelated things in one script on purpose — it is one trip to the SQL
-- editor for the owner rather than three.

-- ─────────────────────────────────────────────── 1. How many are left
--
-- Null, not 0. Null means "not tracked", which is the honest default for 47
-- rows nobody has counted; 0 would mean "sold out" and put a warning on every
-- product in the catalogue the moment this runs.
alter table public.site_collection_products
  add column if not exists stock integer;

comment on column public.site_collection_products.stock is
  'Units left, or NULL when the owner is not tracking this piece. At 5 or fewer the site says so under the photograph; at 0 it says the piece is gone.';

-- ─────────────────────────────────────────── 2. Hebrew names on a Hebrew site
--
-- All 47 products were entered with their Latin model name in `name`, which is
-- the field the Hebrew site reads — so the Hebrew catalogue was in English.
--
-- These are model names ("milo", "aria", "nero"), not English words, so they
-- are TRANSLITERATED rather than translated: a translation of "sole" would be
-- "שמש", which is not what the piece is called.
--
-- The Latin goes to `name_en`, where it was always supposed to live and where
-- it is correct — so this fixes the English site at the same time, instead of
-- throwing the real names away.
--
-- Only rows that still hold their Latin name are touched, so running this
-- twice changes nothing the second time.

update public.site_collection_products
   set name_en = coalesce(nullif(name_en, ''), name)
 where name !~ '[֐-׿]';

update public.site_collection_products p
   set name = t.he
  from (values
    ('milo','מילו'), ('aria','אריה'), ('kol','קול'), ('Elba','אלבה'),
    ('nero','נרו'), ('ciro','צ''ירו'), ('sora','סורה'), ('tago','טאגו'),
    ('luma','לומה'), ('val','ואל'), ('reno','רנו'), ('vero','ורו'),
    ('aero','אארו'), ('maro','מארו'), ('dex','דקס'), ('calmo','קלמו'),
    ('terra','טרה'), ('tivo','טיבו'), ('lino','לינו'), ('paro','פארו'),
    ('rivo','ריבו'), ('sole','סולה'), ('zen','זן'), ('tano trio','טאנו טריו'),
    ('vela','ולה'), ('kaia','קאיה'), ('rio','ריו'), ('stone','סטון'),
    ('elio','אליו'), ('lucia','לוצ''יה'), ('mirel','מירל'), ('avela','אוולה'),
    ('noma','נומה'), ('James','ג''יימס'), ('hat','האט'), ('siena','סיינה'),
    ('bello','בלו'), ('Dave','דייב'), ('livo','ליבו'), ('kai','קאי'),
    ('capri','קאפרי'), ('kind','קינד'), ('jel','ג''ל'), ('cotta','קוטה'),
    ('luz','לוז'), ('rama','רמה'), ('under','אנדר')
  ) as t(en, he)
 where lower(p.name) = lower(t.en)
   and p.name !~ '[֐-׿]';

-- ────────────────────────────────────────────── 3. The home page's headings
--
-- These live in site_texts, so the copy in the code is only a fallback and
-- editing it alone would change nothing on the live site.
update public.site_texts set value = 'קולקציות חמות'  where key = 'home.collections.title';
update public.site_texts set value = 'מוצרים מובילים' where key = 'home.products.title';
update public.site_texts set value = 'הפרויקטים שלנו' where key = 'home.projects.title';
