# Aluma — what's left

**Where you are:** database set up, you're inside `/admin`, and there's a
Vercel deployment at `aluma-three.vercel.app`.

**Read this first — it explains most of what looks broken.**

That Vercel site is publishing the **`main`** branch. All the work of the last
weeks is on a branch called **`calm-rebuild`**. So `aluma-three.vercel.app` is
showing an older version of the site.

That's why the contact form looks unfinished, why the write-to-us section
behaves oddly, and why the layout has problems you've already reported as
fixed. **They are fixed — on the branch Vercel isn't publishing.** Job 1 is
one setting, and it changes all of it at once.

| # | Job | Time | Why |
|---|---|---|---|
| 1 | Point Vercel at the right branch | 2 min | Everything else you're seeing depends on this |
| 2 | Run one small SQL script | 3 min | Adds the price field |
| 3 | Turn on emails | 10 min | Contact-form messages reach nobody without it |
| 4 | Move the domain to Namecheap | 20 min + wait | You have the code — this is ready to go |

---
---

# JOB 1 — Point Vercel at the right branch (2 minutes)

1. Go to **`vercel.com`** and sign in.
2. Click the project — the one serving **aluma-three.vercel.app**.
3. Click **Settings** in the top row of tabs.
4. In the left menu click **Git**.
5. Find the box labelled **Production Branch**. It currently says `main`.
6. Change it to exactly:

   ```
   calm-rebuild
   ```

7. Click **Save**.

**Changing the setting does not rebuild the site.** You have to trigger one:

8. Click the **Deployments** tab at the top.
9. Find the newest deployment in the list. On its right there's a **⋯** button.
10. Click it, then click **Redeploy**.
11. In the box that appears, click **Redeploy** again to confirm.
12. Wait about two minutes.

## Check it worked

Open **aluma-three.vercel.app/faq**. You should see the questions, and at the
bottom a **contact form that is already open** — not a row you have to click.
If it's still a row you click, the redeploy hasn't finished or the branch
didn't save. Check Settings → Git again.

**✅ Tell me: "Job 1 done" — and tell me if anything still looks wrong, because
from then on we're both looking at the same site.**

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

## Step B — wait

Transfers take **up to 5–7 days**. Usually faster. There's nothing to do
meanwhile, and **the current site keeps working the whole time** — the DNS
doesn't change until you change it.

You may get an email from Lovable asking to confirm the transfer out.
Approving it makes this finish in hours instead of days.

**⏸️ Stop here until Namecheap says the domain is yours.**

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
