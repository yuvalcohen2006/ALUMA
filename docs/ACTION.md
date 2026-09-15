# What Aluma needs from you

Updated 15 September 2026. No explanations — what's missing, then exactly what to click.

---

## 1. Run two database scripts

The site already works without them. The first puts the stock numbers on
screen; the second puts the English product names back in the admin's **שם**
field (it shows מילו there now, the site shows milo).

1. Go to **supabase.com/dashboard/project/jzqayfllojeqivwbbuyf/sql/new**
2. Open `supabase/migrations/20260910130000_seed_stock_counts.sql` from the
   project folder, select all of it, and copy
3. Paste it into the big empty box
4. Click **Run** (bottom right, or Ctrl+Enter)
5. It should say **Success. No rows returned**
6. Click **New query** (top left), then repeat 2–5 with
   `supabase/migrations/20260915120000_product_names_back_to_latin.sql`

The stock numbers are invented. Six pieces come out low so you can see the
orange line — cotta is one of them and it is on the home page.

---

## 2. Materials the client "added" are not in the database

Nothing was saved anywhere the site reads. The admin has no materials screen;
the four materials on the site (Sunbrella, aluminium, porcelain, PolyStone) are
built in, and they now also slide along the bottom of the home page.

If they meant the materials of **one product**:

1. **alumaoutdoor.com/admin** → **קולקציות ומוצרים**
2. Click a collection → click a product
3. Find the **חומרים** box
4. One material per line (e.g. `אלומיניום` Enter `בד Sunbrella`)
5. Click somewhere outside the box, then **שמירה**

It appears on that product's page under **חומרים**.

If they want to add brand-new materials of their own to the site, that screen
does not exist yet — tell me.

---

## 3. Stock counts — how to set them yourself

A product says **"נותרו 3 במלאי"** in orange under its photo at 5 or fewer.

1. **alumaoutdoor.com/admin** → **קולקציות ומוצרים**
2. Click a collection → click a product
3. Find **כמה נשארו במלאי**
4. Type a number → **שמירה**

Leave it blank and nothing appears at all.

---

## 4. No customer reviews on the site

The reviews section is hidden completely until there is at least one.

1. Go to **alumaoutdoor.com/admin**
2. Sidebar → **המלצות לקוחות**
3. Click **המלצה חדשה**
4. Fill in **הציטוט**, **שם הלקוח**, **פרטים** (e.g. "וילה, הרצליה")
5. Turn on the **פורסם** switch
6. Click **שמירה**

Repeat 3–6 for each one. Real quotes only, from customers who agreed.

---

## 5. No colours on any product

1. **alumaoutdoor.com/admin** → **קולקציות ומוצרים**
2. Click a collection → click a product
3. Scroll to **צבעים**
4. Click **הוספת צבע**
5. Fill in the colour name, pick the shade in the colour square
6. Click **תמונה בצבע הזה** and choose a file
7. **Wait for the upload to finish** before pressing save
8. Click **שמירה**

⚠️ Each colour's photo must be the **same angle and distance** as the main photo,
or the furniture jumps when someone switches colour.

---

## 6. All six projects on the site are invented

They are examples with generated photographs. None is work Aluma did.

1. **alumaoutdoor.com/admin** → **פרויקטים**
2. Click **פרויקט חדש**
3. Fill in **כותרת**, **מיקום**, **קטגוריה**, **תיאור**
4. Click **תמונת שער** and choose a file
5. Click **גלריה** and add more photos
6. Turn on **פורסם**
7. Click **שמירה**

⚠️ **The moment you publish one real project, all six placeholders disappear.**
So add two or three in one sitting, or the page shows a single project.

---

## 7. "View it in your space" (AR) — now hidden

Every 3D model on that page was dead (the host deleted them), so the page showed
an empty grey box. I've hidden it so no customer runs into it.

**To bring it back:** tell me. It needs real 3D models of your own furniture,
roughly $250–500 each and 2–3 weeks.

**Nothing to do now.**

---

## 8. Product names — English on both sites

Product names show exactly as typed, in English, on the Hebrew site too.

To rename a product:

1. **קולקציות ומוצרים** → collection → product
2. Change the **שם** field (e.g. `milo` → `Milo`)
3. **שמירה**

Collections are different: they keep a Hebrew name, plus **השם באנגלית** for
the English site (**קולקציות ומוצרים** → the pencil icon).

---

## 9. Resend key — worth replacing

Your key travelled through a chat message. It works; a fresh one is cleaner.

1. **resend.com/api-keys**
2. Next to the existing key → **⋮** → **Delete**
3. **Create API Key** → name `aluma-site` → permission **Sending access** → **Add**
4. Copy the new key
5. **supabase.com/dashboard/project/jzqayfllojeqivwbbuyf/functions/secrets**
6. Next to **RESEND_API_KEY** → **⋮** → **Edit** → paste → **Save**

Not urgent.

---

## 10. Uploading any photo

A crop window opens first. **Drag to choose the frame, scroll to zoom.**
On the right you see every shape the site really uses it in — check all of them
before saving.

| Photo | Size | Shape |
|---|---|---|
| Home page main image | 2400 × 1350 | landscape |
| Collection | 1500 × 2000 | **portrait** |
| Product | 1600 × 1600 | square — the page shows exactly this square |
| Product in a colour | 1600 × 1600 | square, same angle |
| Project | 2000 × 1333 | landscape |
| Article | 1600 × 900 | landscape |

Up to 8MB. **JPG or PNG only** — an iPhone HEIC is refused, convert it first.

The product photos uploaded before the crop window existed were squared around
the furniture automatically. To frame one differently yourself: product →
**החלפה** under the main photo → choose the file → the crop window opens.

---

## Never send me

The Supabase `service_role` key, or any database password.
The `anon` key is fine — it is public by design and already inside the website.
