# Aluma — the calm rebuild

**Status:** approved 2026-08-01. Supersedes the styling decisions in earlier ROADMAP phases.

## Why

The client's verdict on the current site: *"כל האתר בכללי לעשות כמה שיותר מינימליסטי ופחות צועק, שיהיה נקי וקטן"* —
make the whole thing as minimal and un-shouty as possible, clean and small. Plus nine
specific complaints (see Complaint map below).

"It's a mess" was measurable, not a matter of taste:

| | Before | Target |
|---|---|---|
| Distinct type sizes | 26 | 5 |
| Font weights | 4 | 2 |
| Corner radii | 9 | 1 |
| Shadow styles | 5 | 0 on cards |
| Terracotta usages | 358 across 50 files | accent only, <5 per page |
| Cards with border AND shadow | 21 | 0 |

## The reference, corrected

The client named **KAVE** as "the Swedish outdoor company". Kave Home is **Spanish**
(Girona, 2013) and is a high-volume e-commerce catalogue — 20 localised storefronts,
prices everywhere, sale banners, deep filter rails. Structurally it is the opposite of
what he asked for.

The genuine Swedish outdoor company is **Skargaarden** (Gävle, 2008; teak + stainless,
outdoor only, project-led, no homepage prices). So the direction is:
**Kave Home's photography, Skargaarden's structure.**

Supporting references: Tribù (made-to-order luxury outdoor), Hem (delays its category
grid to section 7 of 10), Hillerstorp and Brafab (Swedish outdoor, no prices, ≤4
homepage categories), Audo Copenhagen. Anti-pattern: NordicNest.

The decisive datum — **product card text elements**:
Skargaarden 3 · Aluma today 5+ · NordicNest 6–7. That delta *is* loud vs calm.

Second datum: **none of the six reference brands runs a testimonial carousel.**
Skargaarden's proof is a grid of client names (Rosewood Hong Kong, Nobis Palma).

## Design system

**Type — 5 roles, hard cap. 2 weights (400/500). No bold headings.**

| Role | Size | Leading |
|---|---|---|
| display | clamp(36px, 5vw, 60px) | 1.1 |
| heading | clamp(24px, 3vw, 30px) | 1.25 |
| body | 18px | 1.75 (Hebrew needs more air than Latin) |
| small | 15px | 1.6 |
| label | 13px | 1.5 |

Hebrew has no uppercase, so labels earn distinction through size + colour, never
`uppercase`, and `tracking-normal` everywhere — letter-spacing breaks Hebrew rhythm.

**Colour** — palette unchanged (warm white / charcoal / sand / terracotta). The bug was
*usage*, not the palette. Terracotta becomes a genuine accent: at most a few per page.

**Chrome** — cards have no border, no shadow, no radius. The photograph sits on the
page. Hover is an image crossfade only: no scale, no lift, no shadow.

**Rhythm** — sections `py-20 md:py-28 lg:py-36`. Product grids 3 columns (not 4) with
`gap-y` roughly double `gap-x`; uneven vertical breathing is what makes a grid read as
curated rather than dumped.

## Complaint map

| # | Complaint | Resolution | Phase |
|---|---|---|---|
| 1 | Homepage dumps all categories, no warm-up | hero → brand statement → 3 collections → 6 products → 3 projects → testimonials. Categories move to /collections | B |
| 2 | Delete the price question; make FAQ admin-editable | FAQ moves to a DB table with CRUD | D |
| 3 | Collections nav opens a dropdown, not a page | all dropdowns removed | B |
| 4 | Admin for products, projects and texts | editable texts + FAQ CRUD + variants + an /admin guide | D |
| 5 | Make sure DIY works | honest: AR shows Khronos demo models. Fabric folds into product colour swatches | C/D |
| 6 | Materials pages prettier | narrative blocks (Tribù model), not spec cards | C |
| 7 | Whole site quieter | the design system above + delete StickyCTA and MobileActionBar | A |
| 8 | Club page after signup is cheap | bordered+shadowed card on cream gradient → quiet centred form | C |
| 9 | שווה לדעת is just materials + projects | becomes articles + materials only, demoted to the footer; projects gets its own nav entry | B |
| 10 | WhatsApp button missing | it is `hidden md:flex lg:hidden` — invisible on phone AND desktop. Fixed, bottom-right, always | A |

## Phases

- **A — calm layer**: type/radius/shadow tokens, card-chrome sweep, delete StickyCTA +
  MobileActionBar, fix WhatsApp.
- **B — homepage + nav**: new homepage order, categories to /collections, flat 6-item nav,
  new Projects entry, שווה לדעת to the footer.
- **C — page rebuilds**: materials as narrative, club/auth, projects page.
- **D — admin**: `site_texts` for editable copy, `site_faqs`, `product_variants` +
  colour swatches on the product page, and an /admin guide page.

## Explicitly cut

Sticky CTA bar · mobile action bar · card borders/shadows/hover-lift · homepage category
grid · badges of any kind · star ratings · mega-menus · promo bars · more than 2 font
weights · more than 5 type sizes · `100vh` heroes · parallax · counters.

## Honest limits

- **No invented reviews.** The testimonial section renders nothing until `site_reviews`
  has real rows. A client-name row is offered as the stronger alternative.
- **AR cannot be "made to work"** in code — it loads Khronos sample furniture. It needs
  commissioned GLB/USDZ models. Labelled honestly until then.
