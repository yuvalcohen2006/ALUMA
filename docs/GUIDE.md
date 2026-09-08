# Aluma — what's left

Checked against your live site and database on **8 September 2026**.

The technical setup is done. What remains is content, plus one thing to confirm.

| | | |
|---|---|---|
| ✅ | Database script | done |
| ✅ | Sign-in address | done |
| ✅ | Three home-page products | done — 3 picked |
| ⚠️ | **Did the test email arrive?** | **do this first, 1 minute** |
| ○ | English names | optional — 0 of 47 products, 0 of 6 collections |
| ⬜ | Customer reviews | 0 — the section is hidden until there is one |
| ⬜ | Colours on products | 0 |
| ⬜ | Real projects | 6 placeholders on the site |
| ○ | Labels on products | optional |

---

# ⚠️ FIRST — one look in your spam folder

Here is where the email problem actually stands.

**Resend accepts our mail.** I sent one straight to their API with your key and
your sending address, and it came back accepted, with a message id. So the key
works, `notify.alumaoutdoor.com` is verified and able to send, and
`noreply@notify.alumaoutdoor.com` is a valid sender. None of those is the
problem.

That leaves two possibilities, and **one look tells us which**.

I have just sent you a matched pair:

| | Subject | Sent to |
|---|---|---|
| **A** | `Aluma DIRECT test B` | artechb152@gmail.com |
| **B** | `פנייה חדשה מהאתר — בדיקה ב` | outdooraluma@gmail.com |

**A went straight to Resend. B went through your website's contact form.**
Check both inboxes, **including spam and "Promotions"**.

### What each result means

**Both arrived (probably in spam):** nothing is broken. A brand-new sending
domain has no reputation with Gmail, so the first messages get filtered. Mark
one as "not spam" and it settles down within a few days. We are done.

**A arrived, B did not:** the website is not reaching Resend, and the cause is
almost certainly the secret. Go to
`https://supabase.com/dashboard/project/_/functions/secrets` and check the name
is **exactly** `RESEND_API_KEY` — no trailing space, correct spelling, and on the
**aluma** project. Also check whether an `OWNER_EMAIL` secret exists there; if it
does, your form emails have been going to whatever address it holds.

**Neither arrived:** the mail is leaving Resend and being dropped before it
reaches you. Tell me and I will look at authentication records next.

---

# English names — optional

**Where:** קולקציות ומוצרים → click a collection → click a product →
**השם באנגלית**, beside the Hebrew name.

**Collections too:** קולקציות ומוצרים → the pencil icon on a collection →
**השם באנגלית**.

**Entirely optional, and nothing blocks you.** The rule that refused to save
without an English name is gone — one name is enough. Fill these in whenever you
feel like it, or never.

Where a name is missing the English site simply shows the Hebrew one. Untidy for
an English visitor, not broken.

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
Test A (direct) arrived?          yes / no / in spam
Test B (through the form) arrived? yes / no / in spam

English names (optional)?         yes / not bothering
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
