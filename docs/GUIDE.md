# Aluma — what's left

The site is live at **https://alumaoutdoor.com** with the furniture on it.
Checked against the live site and the live database on 6 September.

| | |
|---|---|
| Domain | ✅ live, and `www` now redirects to it |
| Vercel publishing the right branch | ✅ |
| Collections | ✅ **6**, all visible |
| Products | ✅ **47**, all visible, every photo loading |
| Contact-form emails | ✅ arriving |
| Sign-in on the real domain | ⚠️ **Job 1 — 2 minutes** |
| Projects, reviews, colours | ⚠️ **Job 2 — still empty** |
| Email from the real domain | 🔜 Job 3, optional |

---
---

# JOB 1 — Finish the sign-in setup (2 minutes)

Google sign-in still sends people to the old preview address. The site now
catches that and carries them home, so it works — but the round trip is
avoidable and the setting should just be right.

1. **supabase.com/dashboard** → the **aluma** project.
   - ⚠️ The address bar must contain **`jzqayfllojeqivwbbuyf`**.
2. Left icon strip → **Authentication** → **URL Configuration**.
3. **Site URL** — change it to:

   ```
   https://alumaoutdoor.com
   ```

4. **Redirect URLs** → **Add URL**:

   ```
   https://alumaoutdoor.com/**
   ```

5. Leave the existing entries alone. Extra ones do no harm.
6. **Save.**

### Check it worked

Open **alumaoutdoor.com/admin/login**, sign in with Google, and watch the
address bar. You should stay on alumaoutdoor.com the whole way.

**✅ Tell me: "Job 1 done."**

---
---

# JOB 2 — The three things still empty

Everything below is content only. Nothing here is technical.

Go to **alumaoutdoor.com/admin**.

## Projects — 0 so far

**פרויקטים** → the dashed **מוצר חדש** tile. Name, location, description,
photos. The home page shows three.

Photos: **⁦2000 × 1333⁩**, landscape. Portrait phone shots get cropped here.

## Reviews — 0 so far

**המלצות לקוחות**. The section stays invisible on the site until there is at
least one, so an empty site never shows an empty box. Real quotes only, from
customers who agreed to be quoted.

## Colours — 0 so far

This is the one worth doing, because it is the feature customers notice.

Open any product → scroll to **צבעים**. Each colour needs a photo of *that
piece in that colour*, shot from the same angle as the main photo — otherwise
the furniture jumps when someone switches. **⁦1600 × 1600⁩**, square.

A new product already starts with white, so there is nothing to set up.

## While you are in there

Every screen works the same way now:

- A row is a **button** — click anywhere on it to open the thing.
- **Edit** and **delete** appear on the right when you point at a row.
- The **dashed tile** adds a new one, and sits in the same grid as the things
  it makes.
- The **drag handle** on the left of each row sets the order on the site.

**✅ Tell me when the projects and colours are in** — I will do a final pass
against real content.

---
---

# JOB 3 — Email from your own domain (optional, 10 minutes)

Contact-form messages already reach **outdooraluma@gmail.com**. This only
changes who they appear to come *from*, so it can wait.

1. **resend.com** → **Domains** → **Add Domain**.
2. Enter **`notify.alumaoutdoor.com`**. The `notify.` prefix matters — mail on
   a subdomain means a future spam problem can never damage the main domain.
3. Resend shows DNS records. Add each at **namecheap.com** → **Domain List**
   → **MANAGE** → **Advanced DNS**.
   - Namecheap's **Host** field wants only the part *before*
     `.alumaoutdoor.com`. If Resend says `send.notify.alumaoutdoor.com`, type
     `send.notify`.
4. Back in Resend, click **Verify**.

**✅ Tell me "Resend verified" and I will switch the sender over.**

---
---

# Photo sizes

Every upload box states its own size, but here is the whole set:

| Photo | Make it | Shape |
|---|---|---|
| Home page main image | ⁦2400 × 1350⁩ | landscape |
| Collection image | ⁦1600 × 1600⁩ | square |
| Product photo | ⁦1600 × 1600⁩ | square |
| Product in a colour | ⁦1600 × 1600⁩ | square, same angle as the main photo |
| Project photo | ⁦2000 × 1333⁩ | landscape |
| Article photo | ⁦1600 × 1067⁩ | landscape |

Up to 8MB each, JPG or PNG. HEIC needs converting first.

**How to check a photo's size:** right-click → **Properties** → **Details** on
Windows; click once and press **Cmd+I** on a Mac. Look for "Dimensions".

**The two that catch people out:**
- The home page image is cropped much taller on a phone — keep the subject
  centred, away from the left and right edges.
- A collection image is shown as a square tile *and* as a wide banner. Leave
  air around the furniture or the wide crop cuts it.

---

# 📬 WHAT TO SEND ME

```
JOB 1  Supabase Site URL updated?     yes / no
JOB 2  Projects added?                yes / not yet
JOB 2  Colours on any product?        yes / not yet
JOB 3  notify. subdomain verified?    yes / not yet / skipping
```

**Never send me** the Supabase `service_role` key or any database password.
The `anon` key is fine — it is public by design and already ships inside the
website.

---

# Two things I could not fix in code

**The AR feature shows generic furniture.** "View it in your space" loads
sample 3D models from Google — a generic sofa, chair and table, not your
products. Real models have to be commissioned, roughly $250–500 per product
and 2–3 weeks. The page says plainly that they are demonstrations. **Say the
word and I will hide it** until real ones exist.

**The English site is partly translated.** The pages a customer walks through
are done — home, collections, product pages, projects, the journal, materials,
the club, About, 404 and thank-you. Still Hebrew under `/en`: the
questionnaire, the build-your-own pages, the club account screens, and the
legal and accessibility statements. I would leave the legal ones in Hebrew in
any case — they are legally meaningful documents for an Israeli business, and
a translation of mine is not the same document.
