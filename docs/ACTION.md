# What's left for you

Updated 27 September 2026. Only what you have to do, in order.

---

## 1. Replace the six invented projects

They're examples with generated photos — none is Aluma's work. The moment one
real project is published, all six disappear, so add two or three at once.

**admin → פרויקטים → פרויקט חדש** → fill it in → add photos → tick **פורסם** → **שמירה**

---

## 2. Tick materials on every product

0 of 47 products have materials, so no product page shows the materials box.

**admin → קולקציות ומוצרים** → collection → product → **חומרים** → tick → **שמירה**

---

## 3. A photo for "שולחנות אש"

It's the only collection without one.

**admin → קולקציות ומוצרים** → the pencil on שולחנות אש → add the photo → **שמירה**

---

## 4. English names for the six collections

The English site shows them in Hebrew.

**admin → קולקציות ומוצרים** → pencil on each → **השם באנגלית** → **שמירה**

---

## 5. Run one script

Without it, changing a product's **שם** in the admin doesn't change the site.

1. **supabase.com/dashboard/project/jzqayfllojeqivwbbuyf/sql/new**
2. Copy all of `supabase/migrations/20260915120000_product_names_back_to_latin.sql`
3. Paste → **Run**

---

## 6. Send me a name for the accessibility coordinator

Israeli law requires a named person on the accessibility page. It has the
phone and email, but no name.

---

## 7. Replace the Resend key

It was pasted in chat.

1. **resend.com/api-keys** → **⋮** next to the key → **Delete**
2. **Create API Key** → **Sending access** → copy it
3. **supabase.com/dashboard/project/jzqayfllojeqivwbbuyf/functions/secrets**
4. **RESEND_API_KEY** → **Edit** → paste → **Save**

---

## 8. Tell Google the site exists

1. **search.google.com/search-console** → **Add property** → **Domain** → `alumaoutdoor.com`
2. Add the TXT record it gives you at your domain provider → **Verify**
3. **Sitemaps** → type `sitemap.xml` → **Submit**

---

## Never send me

The Supabase `service_role` key, or any database password.
