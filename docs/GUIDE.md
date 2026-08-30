# Aluma — what's left

**Where you are:** jobs 1–3 done. Vercel is on `calm-rebuild`, the price
script has run, and emails are on. The domain transfer is paid for and
waiting.

**Two things left:** let the transfer finish (Job 4 — mostly waiting), and
fill the site with real products and photos (Part 2). You can hand the
customer the Vercel link today — see **Handing it over before the domain
lands**, which has one Supabase setting you must change first or their
sign-in will fail.

**Read this first — it explains most of what looks broken.**

That Vercel site is publishing the **`main`** branch. All the work of the last
weeks is on a branch called **`calm-rebuild`**. So `aluma-three.vercel.app` is
showing an older version of the site.

That's why the contact form looks unfinished, why the collection names are
printed enormous across the photographs, and why the layout has problems
you've already reported as fixed. **They are fixed — on the branch Vercel
isn't publishing.** Job 1 is one setting, and it changes all of it at once.

The setting is not where it used to be, which is why you couldn't find it.
Job 1 says exactly where it moved to.

| # | Job | Time | Why |
|---|---|---|---|
| 1 | Point Vercel at the right branch | 3 min | Everything else you're seeing depends on this |
| 2 | Run one small SQL script | 3 min | Adds the price field |
| 3 | Turn on emails | 10 min | Contact-form messages reach nobody without it |
| 4 | Move the domain to Namecheap | 20 min + wait | You have the code — this is ready to go |

---
---

# JOB 1 — Point Vercel at the right branch (3 minutes)

**You couldn't find it because it moved.** It used to live under Settings →
Git. Vercel now keeps it under **Environments**. Here is exactly where.

1. Go to **`vercel.com`** and sign in.
2. Click the project — the one serving **aluma-three.vercel.app**.
3. Click **Settings** in the row of tabs across the top.
4. In the menu down the left, click **Environments**.
   - Not "Git". Git is still there, and the branch setting is no longer in it.
5. You'll see a list with **Production** at the top. Click **Production**.
6. Scroll to the section headed **Branch Tracking**.
7. There's a box showing `main`. Clear it and type exactly:

   ```
   calm-rebuild
   ```

8. Click **Save**.

### Now force a rebuild

Saving changes the setting but does **not** rebuild the site — Vercel waits
for the next push. Make it build now:

9. Click the **Deployments** tab at the top.
10. The newest deployment is the first row. At its right end there's a **⋯**
    button (three dots). Click it.
11. Click **Redeploy**.
12. A box appears. Click **Redeploy** in it to confirm.
13. Wait about two minutes. The row shows **Building**, then **Ready**.

### Check it worked

Open **aluma-three.vercel.app/faq**.

- The contact form at the bottom should be **already open** — not a row you
  click to expand.
- Scroll to the collections: the collection name should sit **above** each
  photograph as normal text, not as a huge word printed over the picture.

If either is still the old way, the redeploy hasn't finished, or step 7 didn't
save. Go back to Settings → Environments → Production and check the box still
says `calm-rebuild`.

### If you can't find "Environments" at all

Some accounts still show the older layout. In that case:
**Settings → Git → Production Branch**, change it there, then do steps 9–13.
Either location works — it's the same setting.

**✅ Tell me: "Job 1 done."** From then on we're both looking at the same site,
which matters more than anything else on this list.

---
---

# JOB 2 — Run one small SQL script (3 minutes)

**What this does:** adds an optional price to products. Optional means exactly
that — leave it empty and no price appears anywhere.

1. Go to **`supabase.com/dashboard`** and open the **aluma** project.
   - ⚠️ The address bar must contain **`jzqayfllojeqivwbbuyf`**.
2. Click **SQL Editor** in the icon strip on the far left.
3. Click **+ New query**.
4. Open this file on your computer with Notepad or TextEdit:

   ```
   supabase/migrations/20260830100000_product_prices.sql
   ```

5. Select all (`Ctrl+A`), copy (`Ctrl+C`), click into the Supabase box, paste
   (`Ctrl+V`).
6. Click **Run**.
7. You should see **Success. No rows returned.**

Safe to run twice — it does nothing the second time.

**✅ Tell me: "Job 2 done."**

---
---

# JOB 3 — Turn on emails (10 minutes)

**What this does:** when somebody fills in the contact form, you get an email.
Right now the message is saved in the admin panel but nobody is told.

## The detail everybody gets wrong

Until the domain is connected, the email service runs in **test mode**, and in
test mode it delivers **only to the exact address the account was created
with**.

**So create the account with `outdooraluma@gmail.com`.** A personal address
means every test email goes there and the studio inbox stays empty — which
looks exactly like "the contact form is broken".

## Step A — make the account

1. Go to **`resend.com`** → **Sign Up**.
2. Sign up using **outdooraluma@gmail.com**.
3. If it asks for a region, choose **EU (Ireland)**.
4. It will push you to "Add a Domain". **Skip it** — click **API Keys** in the
   left menu instead. We can't verify a domain we don't own yet.

## Step B — create the key

1. Left menu → **API Keys** → **Create API Key**.
2. **Name:** `aluma`. **Permission:** **Sending access**.
3. Click **Add**. A long code starting with **`re_`** appears.

⚠️ **Copy it now.** Resend shows it once and never again.

## Step C — give the key to the site

In Supabase, not in Resend:

1. **`supabase.com/dashboard`** → the **aluma** project.
2. Far-left icon strip → **Edge Functions** → **Secrets**.
   (Some versions: **Project Settings → Edge Functions → Secrets**.)
3. **Add new secret**: name `RESEND_API_KEY`, value = the `re_...` code. Save.
4. **Add new secret**: name `OWNER_EMAIL`, value `outdooraluma@gmail.com`. Save.

Names must be exact — capitals and underscores included.

## Check it worked

1. On the site, click **שאלות ותשובות**.
2. The form is at the bottom, already open. Fill it in and send.
3. An email should arrive at outdooraluma@gmail.com within a minute.

**If the form says it sent but no email arrives**, that's expected before this
job is done — the message is still saved, and you can read it in
**/admin → פניות מהאתר**. Nothing is ever lost.

If it still doesn't arrive after this job, go to **resend.com → Logs**. A
message listed as blocked means the test-mode rule above.

**✅ Tell me: "Job 3 done, email arrived."**

---
---

# JOB 4 — Move the domain to Namecheap (20 minutes, then a wait)

**Yes, Namecheap works.** They accept inbound `.com` transfers, and you already
have the two things that usually hold this up: the **transfer lock is off** and
you have the **authorisation code**.

## Good news about your DNS

I looked at the records you sent. **There is no email on alumaoutdoor.com** —
no MX records at all. Your mail is Gmail, on a separate address. That means
**this transfer cannot break your email.** That's normally the scary part, and
it doesn't apply to you.

Here's what each of your current records is, and what happens to it:

| Record | What it is | What to do |
|---|---|---|
| `A  @  → 185.158.133.1` | Points the site at Lovable's server | **Replace** with Vercel's |
| `A  www → 185.158.133.1` | Same, for www | **Replace** with Vercel's |
| `TXT  _lovable` | Lovable proving you own the domain | **Drop** — you're leaving |
| `TXT  _lovable-email` | Same, for their email | **Drop** |
| `TXT  _lovable.www` | Same, for www | **Drop** |
| `NS  notify → ns3/ns4.lovable.cloud` | Hands the `notify.` subdomain to Lovable | **Drop** — Resend takes this over in Step D |

So: nothing needs re-creating. You're replacing two records and deleting four.
Keep your saved copy anyway until the site is live and green.

## Step A — start the transfer

1. Go to **`namecheap.com`**.
2. Create an account, or sign in if you already have one. Use
   **outdooraluma@gmail.com** so everything lives in one inbox.
3. In the top menu click **Domains** → **Transfer**.
   (Or go straight to `namecheap.com/domains/domain-name-transfer/`.)
4. Type **alumaoutdoor.com** into the box and press the search button.
5. It should say the domain is eligible. Tick it and click
   **Transfer** / **Add to Cart**.
6. When it asks for the **EPP / Auth code**, paste the authorisation code you
   got from Lovable.
7. Go to the cart and pay.
   - A transfer **includes an extra year** of registration, so it isn't a
     wasted fee.
   - **Untick** any add-ons you don't want. Leave **WhoisGuard / Domain
     Privacy** ticked — it's free and hides your home address from spammers.
8. Namecheap emails you a confirmation. **Click the link in it.** The transfer
   does not start until you do.

## Step B — wait (and ignore the missing email)

**If it says "awaiting email confirmation" and no email arrived — you are
fine. Do nothing.**

Namecheap's own documentation: *"Transfers that have reached this stage are
automatically confirmed within 5 days,"* plus 24–48 hours for the registry to
finish. The confirmation email is a way to go **faster**, not a requirement.
Miss it and the transfer still completes.

**The "Transfer status id should be 11" error** when you press *Resend* means
the transfer has already moved past the stage where that email applies. There
is nothing left to resend. It is not a failure, and pressing it again will
keep returning the same thing.

### If you want it to finish sooner

The fastest lever is on the **other** side, not Namecheap's:

1. Log in to **Lovable**.
2. Find the domain / transfer section for alumaoutdoor.com.
3. Look for an outgoing transfer waiting on you, and **approve** it.

A losing registrar that approves ends the wait in hours instead of days. If
there's no such option, open a ticket asking them to *"approve the pending
outbound transfer for alumaoutdoor.com"*.

### Also worth one look

The confirmation email goes to the **registrant address on the WHOIS record**
— which is held at Lovable, not necessarily your Namecheap account address.
Check the spam folder of outdooraluma@gmail.com and of any address Lovable
might have on file.

### When to actually worry

If **7 days** pass with no change, open Namecheap live chat, say the transfer
is stuck, and quote the *"Transfer status id should be 11"* error. That is a
support problem, not something you can fix from the dashboard.

**The current site keeps working the whole time.** DNS doesn't change until
you change it in Step C.

## Step C — point the domain at the site

Only once Namecheap shows alumaoutdoor.com in your **Domain List**:

1. Go to **vercel.com**, open the project, click **Settings** → **Domains**.
2. Type **alumaoutdoor.com** and click **Add**.
3. Choose the option that also adds **www.alumaoutdoor.com** if it offers one.
4. Vercel now shows you the records it needs — usually an **A** record for `@`
   and a **CNAME** for `www`. **Leave this tab open**, you're about to copy
   from it.
   - ⚠️ Use the values **on your screen**. Don't use numbers from this guide or
     from anywhere else — Vercel changes them.
5. In a new tab go to **namecheap.com** → **Domain List** → the **Manage**
   button next to alumaoutdoor.com.
6. Click the **Advanced DNS** tab.
7. **Delete the old records.** Click the bin icon next to:
   - both `A` records pointing at `185.158.133.1`
   - all three `TXT` records starting with `_lovable`
   - both `NS` records for `notify`
8. Click **Add New Record** and enter exactly what Vercel showed you:
   - Type **A Record**, Host **@**, Value = Vercel's IP, TTL **Automatic**
   - Type **CNAME Record**, Host **www**, Value = Vercel's target, TTL
     **Automatic**
9. Click the green tick on each row to save it.
10. Go back to the Vercel tab and wait. The domain turns **green** when it's
    working — usually minutes, up to an hour.

## Step D — move email to the real address

1. **resend.com** → **Domains** → **Add Domain**.
2. Enter **`notify.alumaoutdoor.com`** — the `notify.` part matters. Keeping
   email on a subdomain means a future spam problem can never damage the main
   domain's reputation.
3. Resend shows a set of DNS records. Add each one at Namecheap the same way as
   step 8 above.
   - For the Host field, Namecheap wants the part **before**
     `.alumaoutdoor.com`. If Resend says `send.notify.alumaoutdoor.com`, type
     `send.notify`.
4. Back in Resend, click **Verify**. Can take up to an hour.
5. Tell me it's verified and I'll switch the sender over.

**✅ Tell me: "Domain moved" and "Resend verified".**

---
---

# HANDING IT OVER BEFORE THE DOMAIN LANDS

**Yes — give the customer the `.vercel.app` link now.** Everything they enter
carries across to alumaoutdoor.com automatically. Nothing gets re-typed.

**Why:** the products, projects, photos and texts live in the database, not in
the website. The Vercel address and the future alumaoutdoor.com are the same
site reading the same database. Attaching the domain later just points a name
at what's already running.

## One thing to do first, or their sign-in will fail

The site sends people to Google to sign in and Google has to be told where to
send them back. Right now that list probably only has `localhost`.

1. Go to **`supabase.com/dashboard`** → the **aluma** project.
2. Far-left icon strip → **Authentication**.
3. Click **URL Configuration**.
4. **Site URL** — set it to your Vercel address, in full:

   ```
   https://aluma-three.vercel.app
   ```

5. **Redirect URLs** — click **Add URL** and add both of these, one at a time:

   ```
   https://aluma-three.vercel.app/**
   http://localhost:8080/**
   ```

   The `/**` matters — it means "any page on this site".
6. Click **Save**.

When the real domain is live, come back and add `https://alumaoutdoor.com/**`
the same way, then change **Site URL** to it. Leave the Vercel one in the list;
two entries do no harm.

**Without this**, signing in to `/admin` or to the club from the Vercel address
bounces back to localhost and looks broken.

## What to tell the customer

- The address is temporary and will become alumaoutdoor.com. Their work moves
  with it.
- **Contact-form emails only reach outdooraluma@gmail.com for now** — that's
  the test-mode rule from Job 3, and it lifts when the domain is verified.
  Nothing is lost meanwhile: every message is saved and readable in
  **/admin → פניות מהאתר**.
- Don't share the `.vercel.app` link publicly — post it to customers only once
  it's the real domain, so search engines index the right one.

---
---

# PART 2 — FILLING THE SITE

Everything happens inside `/admin`.

**Two ways in:**
- **`/admin/login`** — email and password, the panel's own door.
- The **Google** button on that same screen.

To stop depending on Google: **הגדרות → הסיסמה שלכם**, type a password twice,
save. No email needed. After that the email-and-password form works.

Nobody without an admin account can get in. Even if they reached the screens,
the database refuses to show or change anything — the permission check lives
there, not in the page.

## The landing screen is the manual

**`/admin`** gives you a card per screen: what it's for, what you can do, and —
the useful bit — **what you'd go looking for there and not find**. Start there
rather than here.

## Before you upload any photo

Every screen with an upload has a grey bar at the top telling you what that
particular photo needs. Click it to open. The short version:

| Photo | Shape | At least |
|---|---|---|
| Homepage main image | Landscape, ~16:9 | 2400 × 1350 |
| Collection image | Square-ish | 1600 × 1600 |
| Product photo | Square | 1600 × 1600 |
| Product in a colour | Square, same angle as the main photo | 1600 × 1600 |
| Project photo | Landscape, ~3:2 | 2000 × 1333 |
| Article photo | Landscape, ~3:2 | 1600 × 1067 |

**How to check a photo's size:** right-click the file → **Properties** →
**Details** on Windows; click it once and press **Cmd+I** on a Mac. Look for
"Dimensions".

**The two that catch people out:**
- **The homepage image is cropped much taller on a phone.** Keep the important
  part in the middle, not near the left or right edge.
- **A collection image is used twice** — as a tall tile in the list, and as a
  wide banner across the top of the collection page. Leave air around the
  furniture or the wide crop will cut it.

Max file size is 8MB. JPG or PNG. If your camera saved HEIC, convert first.

## Order worth doing

1. **קולקציות ומוצרים** — collections first, then products inside them. The
   **פורסם** switch must be on. Homepage shows the first 3 collections and
   first 6 products. Prices are optional; leave blank and none appears.
2. **צבעים וגימורים** — open a product you've **already saved**, scroll to
   **גימורים**. Each colour gets its own photo, shot from the same angle.
3. **פרויקטים** — homepage shows three.
4. **הגדרות** — phone, WhatsApp, address, socials. Changes here update the
   footer, contact page, WhatsApp button and map links all at once.
5. **המלצות לקוחות** — the homepage section stays invisible until there's at
   least one, so an empty site doesn't show an empty box. Real quotes only.
6. **טקסטים** and **שאלות ותשובות** — clearing a text box returns the site to
   its original wording. You can't break anything from here.

---
---

# PART 3 — THE PHOTOGRAPHY YOU STILL NEED

Give the photographer this list word for word:

- **One identical camera setup for every product.** Same camera, lens, height,
  distance. Tape the tripod legs to the floor.
- **Camera height 120cm**, to the middle of the lens.
- **Camera perfectly level** — not tilted down. Use a spirit level.
- **Lens 85–100mm equivalent.** Never wide-angle; it bends straight lines.
- **Aperture f/8–f/11** so the whole piece is sharp.
- **Soft even light** from a large softbox upper-left, plus fill. No hard
  shadows. Identical for every product.
- **Pure white background, lit brighter than the product.** This is what lets
  the retoucher cut cleanly through the gaps in rope and wicker.
- A **colour checker card** shot at the start of each product.

## Per product

| | Shot | Which products |
|---|---|---|
| 1 | Three-quarter from the front-**left**, turned about 35° | All |
| 2 | Three-quarter from the front-**right** | All seating and loungers |
| 3 | Straight-on front | All |
| 4 | Close-up details — weave, grain, stitching | All, 3 or 4 each |

**Quality:** RAW capture, minimum 4000 pixels on the long side. Delivered as
cut-outs at 2400 pixels, PNG with transparency.

**Cut-out rules — say these explicitly:**
- Every gap between slats, rope and wicker must be **see-through**, not filled.
- Soft 1-pixel edge, **no white glow** around the product.
- Feet and legs complete, not trimmed off.
- Test: put the cut-out on a green background and a terracotta one. Any white
  outline, reject it.

## The information sheet — as important as the photos

One row per product:

**Product name · Width (cm) · Depth (cm) · Height (cm) · Seat height (cm) ·
Available colours · Category**

Without exact centimetres the site can't size things correctly.

## Colour variants

Photograph **one** version of each product — fabric colours can be recoloured
digitally, far cheaper than reshooting. But **do photograph separately** when
the frame material changes: teak, aluminium and rope genuinely look different.

---
---

# 📬 WHAT TO SEND ME

```
JOB 1  Vercel on calm-rebuild?      yes / no
JOB 1  Anything still looking wrong after the redeploy?
JOB 2  Price script run?            yes / no
JOB 3  Test email arrived?          yes / no
JOB 4  Domain moved to Namecheap?   yes / not yet
JOB 4  notify. subdomain verified?  yes / not yet
```

**Never send me:** the Supabase `service_role` key, or any database password.
The `anon` key is fine — it's designed to be public and already ships inside
the website's code.

---

# Two things I could not finish in code

**The AR feature shows generic furniture.** The "view it in your space" tool
loads sample 3D models from Google — a generic sofa, chair and table, not your
products. Real 3D models have to be commissioned, roughly $250–500 per product
and 2–3 weeks. The page says plainly that the models are demonstrations. **Say
the word and I'll hide it** until real ones exist — that may be safer for a
handover.

**The English site is partly translated.** Menu, homepage and Q&A are done.
Other pages still show Hebrew under `/en`. Tell me which you want: I finish the
translations, or I hide the language switcher until they're done.
