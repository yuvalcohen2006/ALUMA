# Aluma — what's left

Checked against your live site and database on **8 September 2026**.

The technical setup is done. What remains is content, plus one thing to confirm.

| | | |
|---|---|---|
| ✅ | Database script | done |
| ✅ | Sign-in address | done |
| ✅ | Three home-page products | done — 3 picked |
| ⚠️ | **Did the test email arrive?** | **do this first, 1 minute** |
| ⬜ | English names | 0 of 47 products, 0 of 6 collections |
| ⬜ | Customer reviews | 0 — the section is hidden until there is one |
| ⬜ | Colours on products | 0 |
| ⬜ | Real projects | 6 placeholders on the site |
| ○ | Labels on products | optional |

---

# ⚠️ FIRST — did the test email arrive?

I sent one through your live contact form. **Check `outdooraluma@gmail.com`** for:

> **פנייה חדשה מהאתר — בדיקת מערכת - Claude**

**If it arrived:** email works. Delete that one lead from **פניות** in the admin
and you are done with email. Tell me and I will close it off.

**If it did NOT arrive**, the key is probably fine — check this instead:

1. Go to **resend.com** → **Domains**.
2. Look at **notify.alumaoutdoor.com**. Does it say **Verified**?

The site sends from `noreply@notify.alumaoutdoor.com`, so until that subdomain
verifies, **every email fails no matter how correct the key is.** If it says
*Pending*, press **Verify DNS Records** and give it fifteen minutes.

Tell me either way — I cannot see this from here.

> I have to be straight with you about why I cannot just check. The contact
> function saves the lead first and then tries to send, and if the send fails it
> writes the error to a log nobody reads and still reports success. So the form
> looks fine to you and to the visitor whether or not the mail went out. **I can
> fix that** — one small SQL script and the פניות screen will show "המייל לא
> נשלח" on any lead whose email failed. Say the word.

---

# English names — 0 of 47

This is the biggest remaining job, and it is boring. Do it over a coffee, not
tonight.

**Where:** קולקציות ומוצרים → click a collection → click a product →
**השם באנגלית**, beside the Hebrew name.

**Collections too:** קולקציות ומוצרים → the pencil icon on a collection →
**השם באנגלית**.

### Two things to expect

**Nothing is broken right now.** The English site falls back to the Hebrew name,
so an English visitor sees Hebrew product names — untidy, not broken.

**But the rule bites the moment you edit.** You cannot save a published product
or collection without both names. So the first time you open a product to change
its price, it will refuse to save until you add an English name. That is what you
asked for; I just do not want it to surprise you mid-edit.

If it turns out to be too annoying, tell me and I will make the rule apply only
to newly published items.

---

# Customer reviews — 0

**המלצות לקוחות** in the sidebar.

The section is invisible on the site until there is at least one, so an empty
site never shows an empty box. Real quotes only, from customers who agreed to be
quoted.

---

# Colours on products — 0

The feature customers notice most, and the one with a trap in it.

**Where:** open any product → scroll to **צבעים**.

Each colour needs a photo of **that piece in that colour**, shot from the same
angle and distance as the main photo. If the angle changes, the furniture appears
to jump when someone switches colour.

A new product already starts with white, so there is nothing to set up first.

---

# Real projects — 6 placeholders on the site

The six projects on the site are **invented examples with generated
photographs**. Nothing on that page is work Aluma actually did.

**Where:** פרויקטים in the sidebar.

### ⚠️ Read this before you add the first one

**The moment you publish one real project, all six placeholders disappear.**

That is deliberate — a grid mixing real work with invented examples is worse than
either on its own — but it means your projects page will go from six to one until
you add more. So either add two or three in one sitting, or accept a short page
for a while.

Nothing is lost: the placeholders come back automatically if you unpublish
everything.

---

# Labels on products — optional

On any product page there is a **תווית** dropdown: *מבוקש*, *חם עכשיו*, *חדש*.

Two things worth knowing before you use it:

- **"חדש" already works by itself.** The five most recently added pieces carry it
  automatically. You only need the dropdown to override that.
- **The site shows at most one label per row.** A label on half the products means
  nothing, so it refuses to shout even if you mark everything.

My honest opinion on **חם עכשיו**: it is the one that reads like a discount shop,
and it is a claim you would have to be able to stand behind. Say the word and I
will take it off the list.

---

# When you upload any photo

A window opens first. **Drag the photo to choose what goes in the frame, scroll
to zoom.** Everything outside the frame goes grey.

On the right you see **every shape the site will really use it in** — a product
photo gets cut three different ways. Check all of them before saving. That is
what stops a chair losing its legs on the home page.

| Photo | Make it | Shape |
|---|---|---|
| Home page main image | ⁦2400 × 1350⁩ | landscape |
| Collection image | ⁦1500 × 2000⁩ | **portrait** |
| Product photo | ⁦1600 × 1600⁩ | square |
| Product in a colour | ⁦1600 × 1600⁩ | square, same angle as the main photo |
| Project photo | ⁦2000 × 1333⁩ | landscape |
| Article photo | ⁦1600 × 1067⁩ | landscape |

Up to 8MB. **JPG or PNG only** — an iPhone HEIC is now refused rather than
uploading broken, so convert it first.

---

# 📬 WHAT TO TELL ME

```
Did the test email arrive?        yes / no
If no — does Resend say Verified? yes / no / not sure

English names started?            yes / not yet
Reviews added?                    yes / not yet
Colours on any product?           yes / not yet
Real projects added?              yes / not yet
```

**Never send me** the Supabase `service_role` key or any database password. The
`anon` key is fine — it is public by design and already inside the website.

Your Resend key travelled through a chat message. It is sending-only, so the worst
it can do is send email as you — but once everything works, deleting it in Resend
and creating a fresh one takes thirty seconds.

---

# Two things I could not fix in code

**The AR feature shows generic furniture.** "View it in your space" loads sample
3D models from Google — a generic sofa, chair and table, not your pieces. Real
models run roughly $250–500 each and take 2–3 weeks. The page says plainly that
they are demonstrations. **Say the word and I will hide it** until real ones
exist.

**The English site is partly translated.** The pages a customer walks through are
done — home, collections, products, projects, journal, materials, club, About,
404, thank-you. Still Hebrew under `/en`: the questionnaire, the build-your-own
pages, the club account screens, and the legal pages. I would leave the legal ones
in Hebrew regardless — they are legally meaningful documents for an Israeli
business, and a translation of mine is not the same document.
