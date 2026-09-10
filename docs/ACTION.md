# What Aluma needs from you

Updated 9 September 2026. No explanations — what's missing, then exactly what to click.

---

## 1. No customer reviews on the site

The reviews section is hidden completely until there is at least one.

1. Go to **alumaoutdoor.com/admin**
2. Sidebar → **המלצות לקוחות**
3. Click **המלצה חדשה**
4. Fill in **הציטוט**, **שם הלקוח**, **פרטים** (e.g. "וילה, הרצליה")
5. Turn on the **פורסם** switch
6. Click **שמירה**

Repeat 3–6 for each one. Real quotes only, from customers who agreed.

---

## 2. No colours on any product

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

## 3. All six projects on the site are invented

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

## 4. "View it in your space" (AR) — now hidden

Every 3D model on that page was dead (the host deleted them), so the page showed
an empty grey box. I've hidden it so no customer runs into it.

**To bring it back:** tell me. It needs real 3D models of your own furniture,
roughly $250–500 each and 2–3 weeks.

**Nothing to do now.**

---

## 5. English names — optional

This now genuinely works: what you type shows up on the English site.

1. **קולקציות ומוצרים** → collection → product
2. The **השם באנגלית** field, beside the Hebrew name
3. **שמירה**

For a collection: **קולקציות ומוצרים** → the pencil icon → **השם באנגלית**.

Leave it blank and the English site shows the Hebrew name. Untidy, not broken.

---

## 6. Resend key — worth replacing

Your key travelled through a chat message. It works; a fresh one is cleaner.

1. **resend.com/api-keys**
2. Next to the existing key → **⋮** → **Delete**
3. **Create API Key** → name `aluma-site` → permission **Sending access** → **Add**
4. Copy the new key
5. **supabase.com/dashboard/project/jzqayfllojeqivwbbuyf/functions/secrets**
6. Next to **RESEND_API_KEY** → **⋮** → **Edit** → paste → **Save**

Not urgent.

---

## 7. Uploading any photo

A crop window opens first. **Drag to choose the frame, scroll to zoom.**
On the right you see every shape the site really uses it in — check all of them
before saving.

| Photo | Size | Shape |
|---|---|---|
| Home page main image | 2400 × 1350 | landscape |
| Collection | 1500 × 2000 | **portrait** |
| Product | 1600 × 1600 | square |
| Product in a colour | 1600 × 1600 | square, same angle |
| Project | 2000 × 1333 | landscape |
| Article | 1600 × 900 | landscape |

Up to 8MB. **JPG or PNG only** — an iPhone HEIC is refused, convert it first.

---

## Never send me

The Supabase `service_role` key, or any database password.
The `anon` key is fine — it is public by design and already inside the website.
