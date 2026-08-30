# Aluma — what's left

> ## 🚨 DO THIS FIRST — Google sign-in is broken until you do
>
> **Symptom:** signing in with Google throws *"Firefox can't connect to the
> server at localhost:3000"*.
>
> **Cause:** Supabase's **Site URL** is still the factory default
> `http://localhost:3000`. The site asks Supabase to send people back to the
> Vercel address; that address isn't on Supabase's allowlist, so Supabase
> ignores it and falls back to the Site URL instead.
>
> **This is not in the code.** No deploy fixes it. It is one screen in
> Supabase — Job 1 below, 90 seconds. It works the moment you save; nothing
> needs rebuilding.


Checked against the live project on 30 August. Everything below is either
"done, nothing to do" or a job with steps.

| | Status |
|---|---|
| Vercel publishing the right branch | ✅ done |
| Price field added to the database | ✅ done — the columns are live |
| Editable texts and questions | ✅ done — 13 texts, 7 questions |
| Contact-form emails | ✅ done |
| Domain transfer | ⏳ **in progress, nothing for you to do** |
| Supabase sign-in addresses | ⚠️ **Job 1 — 3 minutes, before the customer touches it** |
| Products, projects, photos | ⚠️ **Job 2 — the site is empty** |
| DNS + email on the real domain | 🔜 Job 3, only once the transfer finishes |

---

## The domain: nothing to do

It now says **"Awaiting release from previous registrar."** That's the normal
state for a `.com`, and it's the state you want — it means the transfer is
running.

**It completes on its own in 5–7 days**, plus a day or two for the registry.
You don't need to find anything in Lovable. There was an optional way to make
it finish sooner by approving from their side; if you can't find it, it makes
no difference to the outcome.

Only act if **7 days pass with no change** — then open Namecheap live chat and
say the transfer is stuck.

**The current site keeps working the whole time.** Nothing changes until you
change the DNS in Job 3.

---
---

# JOB 1 — Let people sign in on the Vercel address (3 minutes)

**Do this before the customer opens the site.** Without it, signing in to
`/admin` or to the club from the Vercel address bounces to a dead page and
looks broken.

The site sends people to Google to sign in, and Google has to be told where
it's allowed to send them back. That list currently only knows about your own
computer.

1. Go to **`supabase.com/dashboard`** and open the **aluma** project.
   - ⚠️ The address bar must contain **`jzqayfllojeqivwbbuyf`**.
2. In the narrow strip of icons down the far left, click **Authentication**.
3. In the menu that appears, click **URL Configuration**.
4. Find the box labelled **Site URL**. Clear it and type:

   ```
   https://aluma-three.vercel.app
   ```

5. Below it is **Redirect URLs**. Click **Add URL**, paste this, and confirm:

   ```
   https://aluma-three.vercel.app/**
   ```

6. Click **Add URL** again and add this one too:

   ```
   http://localhost:8080/**
   ```

   The `/**` on the end matters — it means "any page on this site".
7. Click **Save**.

### Check it worked

Open **aluma-three.vercel.app/admin/login** and sign in with Google. You should
land on the admin panel, not on an error.

**✅ Tell me: "Job 1 done."**

---
---

# JOB 2 — Put something in the site (the big one)

I checked the database: **there are no collections, no products, no projects
and no reviews.** Everything else is ready and waiting for them.

This is the job that makes the site real, and it's the one only you or the
customer can do. Nothing here is technical.

## Where to work

Go to **aluma-three.vercel.app/admin**. That screen is the manual — a card per
area, saying what it's for, what you can do in it, and what you'd go looking
for there and not find.

**Two ways to sign in:** email and password, or the Google button, both at
`/admin/login`. To set a password of your own: **הגדרות → הסיסמה שלכם**, type
one twice, save. No email needed.

## The order that works

1. **קולקציות ומוצרים** — make a collection first (a family, like "סלונים"),
   then add products inside it. The **פורסם** switch must be on or nothing
   shows. The home page uses the first 3 collections and first 6 products, so
   add the best ones first.
2. **צבעים וגימורים** — open a product you've **already saved**, scroll to
   **גימורים**. Each colour needs its own photo of that product in that
   colour, shot from the same angle as the main one.
3. **פרויקטים** — the home page shows three.
4. **המלצות לקוחות** — real quotes only. The section stays invisible on the
   site until there's at least one, so an empty site never shows an empty box.
5. **הגדרות** — phone, WhatsApp, address, socials. Changing these updates the
   footer, the contact page, the WhatsApp button and the map links at once.

Prices are optional. Leave a price blank and none appears anywhere.

## Photo sizes

Every upload box has a grey line above it with the size for that photo. The
whole set:

| Photo | Make it | Shape |
|---|---|---|
| Home page main image | 2400 × 1350 | landscape |
| Collection image | 1600 × 1600 | square |
| Product photo | 1600 × 1600 | square |
| Product in a colour | 1600 × 1600 | square, same angle as the main photo |
| Project photo | 2000 × 1333 | landscape |
| Article photo | 1600 × 1067 | landscape |

Up to 8MB each, JPG or PNG. If your camera saved HEIC, convert first.

**How to check a photo's size:** right-click the file → **Properties** →
**Details** on Windows; click once and press **Cmd+I** on a Mac. Look for
"Dimensions".

**The two that catch people out:**
- The home page image is cropped much taller on a phone, so keep the important
  part in the middle, away from the left and right edges.
- A collection image is shown as a square tile *and* as a wide banner. Leave
  air around the furniture or the wide crop cuts it.

**✅ Tell me when there's a collection with a few real products in it** — I'll
do a final pass against real content. Judging spacing and crops against an
empty catalogue isn't worth much.

---
---

# JOB 3 — Only once the transfer finishes

Namecheap will show alumaoutdoor.com in your **Domain List** when it's done.
Not before.

## Step A — point it at the site

1. **vercel.com** → your project → **Settings** → **Domains**.
2. Type **alumaoutdoor.com**, click **Add**. Take the option that adds
   **www.alumaoutdoor.com** too if it offers one.
3. Vercel shows the records it needs — an **A** record for `@` and a **CNAME**
   for `www`. **Leave that tab open.**
   - ⚠️ Use the values **on your screen**. They change; don't copy them from
     here or anywhere else.
4. New tab → **namecheap.com** → **Domain List** → **Manage** next to
   alumaoutdoor.com → the **Advanced DNS** tab.
5. **Delete these old records** (bin icon on each):
   - both **A** records pointing at `185.158.133.1`
   - all three **TXT** records starting with `_lovable`
   - both **NS** records for `notify`
6. Click **Add New Record** and enter what Vercel showed you:
   - **A Record**, Host `@`, Value = Vercel's IP, TTL Automatic
   - **CNAME Record**, Host `www`, Value = Vercel's target, TTL Automatic
7. Click the green tick on each row to save it.
8. Back in the Vercel tab, wait for the domain to turn **green** — minutes,
   sometimes up to an hour.

**You are not breaking any email by doing this.** I checked your records:
there are no MX entries on alumaoutdoor.com, so no mail was ever delivered
there. Your mail is Gmail, on a separate address, and it is untouched.

## Step B — move the site's own email to the real domain

1. **resend.com** → **Domains** → **Add Domain**.
2. Enter **`notify.alumaoutdoor.com`** — the `notify.` part matters. Email on
   a subdomain means a future spam problem can never damage the main domain.
3. Resend shows DNS records. Add each at Namecheap the same way as step 6.
   - Namecheap's **Host** field wants the part **before** `.alumaoutdoor.com`.
     If Resend says `send.notify.alumaoutdoor.com`, type `send.notify`.
4. Back in Resend, click **Verify**. Can take up to an hour.

## Step C — tell Supabase about the new address

Same screen as Job 1: **Supabase → Authentication → URL Configuration**.

- Add `https://alumaoutdoor.com/**` to **Redirect URLs**.
- Change **Site URL** to `https://alumaoutdoor.com`.
- Leave the Vercel entry in the list. Two do no harm.

**✅ Tell me "domain live" and I'll switch the email sender over.**

---
---

# Handing it to the customer

**You can do this now, before the domain lands** — as soon as Job 1 is done.

Everything they enter carries across to alumaoutdoor.com automatically.
Nothing gets re-typed. The content lives in the database; the Vercel address
and the future alumaoutdoor.com are the same site reading the same data, and
attaching the domain later just points a name at what's already running.

**Two things to tell them:**

- Contact-form emails only reach **outdooraluma@gmail.com** until Job 3 is
  finished. Nothing is lost meanwhile — every message is saved and readable in
  **/admin → פניות מהאתר**.
- Don't share the `.vercel.app` link publicly yet, so search engines index the
  real domain when it arrives.

---

# 📬 WHAT TO SEND ME

```
JOB 1  Sign-in works on the Vercel address?   yes / no
JOB 2  A collection with real products in it? yes / not yet
JOB 3  Domain live at Namecheap?              yes / not yet
JOB 3  notify. subdomain verified?            yes / not yet
```

**Never send me** the Supabase `service_role` key or any database password.
The `anon` key is fine — it's public by design and already ships inside the
website.

---

# Two things I could not fix in code

**The AR feature shows generic furniture.** "View it in your space" loads
sample 3D models from Google — a generic sofa, chair and table, not your
products. Real models have to be commissioned, roughly $250–500 per product
and 2–3 weeks. The page says plainly that they're demonstrations. **Say the
word and I'll hide the feature** until real ones exist — probably the safer
choice for a handover.

**The English site is partly translated.** The menu, home page and Q&A are
done; other pages still show Hebrew under `/en`. Tell me which you want: I
finish the translations, or I hide the language switcher until they're done.
