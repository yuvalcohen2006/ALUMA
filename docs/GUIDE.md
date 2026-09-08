# Aluma — what's left

Checked against your live site and database on **8 September 2026**.

The technical setup is done. What remains is content, plus one thing to confirm.

| | | |
|---|---|---|
| ✅ | Database script | done |
| ✅ | Sign-in address | done |
| ✅ | Three home-page products | done — 3 picked |
| ⚠️ | **Email — send me the Resend log** | **do this first** |
| ○ | English names | optional — 0 of 47 products, 0 of 6 collections |
| ⬜ | Customer reviews | 0 — the section is hidden until there is one |
| ⬜ | Colours on products | 0 |
| ⬜ | Real projects | 6 placeholders on the site |
| ○ | Labels on products | optional |

---

# ⚠️ THE EMAIL PROBLEM — where it actually stands

## What I have ruled out

**Resend accepts our mail.** Every send comes back `200` with a message id —
including one addressed straight to `outdooraluma@gmail.com`, bypassing the
website entirely. So the key works, `notify.alumaoutdoor.com` is verified, and
`noreply@` on it is a valid sender.

**The DNS is essentially right.** I checked every record:

| Record | State |
|---|---|
| Return-path SPF and MX (`send.notify…`) | ✅ correct, pointing at Resend |
| DKIM key (`resend._domainkey.notify…`) | ⚠️ present, but see below |
| DMARC on `alumaoutdoor.com` | ✅ `v=DMARC1; p=none;` |

So the message is leaving Resend. Whatever is going wrong happens **after**
that, and Resend's own log is the only place that records it.

## ⚠️ One record worth fixing regardless

Your DKIM record currently reads:

```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCB…
```

Resend publishes it as:

```
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCB…
```

**The `v=DKIM1; k=rsa;` at the front is missing.** The key itself is complete, and
strictly speaking a mail server is allowed to assume those defaults — which is
probably why Resend still shows the domain as verified — but not every server
does, and Gmail is fussy. It is worth correcting whether or not it turns out to
be the cause.

**To fix it:** Namecheap → **Domain List** → **MANAGE** on alumaoutdoor.com →
**Advanced DNS** → find the TXT record whose Host is `resend._domainkey.notify`
→ click the pencil on its **Value** → put `v=DKIM1; k=rsa; ` at the very front,
before the existing `p=` → green tick → **SAVE ALL CHANGES**.

Do not retype the long key. Click into the field, go to the very beginning, and
type the missing prefix in front of what is already there.

## 📸 What to send me

**A screenshot of your Resend "Emails" page.** That is the one thing I cannot
see and the one thing that answers this.

resend.com → **Emails** in the left menu. It lists every message with a status
beside it — *Delivered*, *Bounced*, *Complained*, *Queued*. I have sent three;
they will all be there.

That status tells us which of these it is, and they need completely different
fixes:

- **Delivered** → it reached Gmail and Gmail filed it. Check spam and
  Promotions; the fix is reputation, not code.
- **Bounced** → Gmail refused it. The bounce reason will say why, and that is
  the answer.
- **Queued / nothing** → it never left Resend.

If you would rather not screenshot it, tell me the status word next to the most
recent message and the reason if there is one.

## Also worth checking while you are there

Is `outdooraluma@gmail.com` definitely a live mailbox you can log into? A hard
bounce on a non-existent address looks exactly like this from where I stand.

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
Resend "Emails" page status?      Delivered / Bounced / Queued
Anything in spam or Promotions?   yes / no
DKIM prefix fixed?                yes / not yet

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
