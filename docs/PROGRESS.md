# Bug sweep — where I'm standing

```
█████████░░░░░░░░░░░  46%
```

**56 of 123 problems fixed. 67 left.**

Last updated: 9 September 2026, after the second session limit.

---

## What this is

14 agents tried to break every page of the site, then a second round of agents
tried to prove each finding wrong. 123 survived that. I'm working down the list.

---

## Done ✅

| | Area | What was wrong |
|---|---|---|
| ✅ | **Home page** | English pages painted in Hebrew first; hero tagline field did nothing; club field pushed the wrong way |
| ✅ | **Collections** | A stray `%` in a link crashed the whole site; a dropped connection looked like an empty shop |
| ✅ | **Products** | Clicking a related item could blank the photo, or show the wrong product's photos under the right name |
| ✅ | **Hidden collections** | Turning a collection off left all its furniture live and browsable |
| ✅ | **Projects** | The six fake projects flashed on every visit; broken images; page threw English readers into Hebrew |
| ✅ | **Contact form** | Was entirely Hebrew on the English site; a failed send locked you out for 30 seconds |
| ✅ | **Q&A** | Screen readers read every answer aloud while they were closed |
| ✅ | **Club sign-up** | An address that already existed reported success and did nothing |
| ✅ | **English names** | The field you fill in never appeared anywhere on the site |
| ✅ | **Speed** | The home page downloaded the whole catalogue twice on every visit |

Plus 25 smaller ones: contrast, arrows pointing the wrong way, dead code.

---

## Left to do ⬜

| | Area | How many | What's in there |
|---|---|---|---|
| ⬜ | **Club & account** | 13 | No "forgot password" anywhere; progress bar fills backwards; menu items lie about where they go |
| ⬜ | **Tools** (AR, fabric, questionnaire) | 13 | Every 3D model is dead; questionnaire accepts a blank name and a fake email |
| ⬜ | **Small pages** (404, cookies, legal) | 12 | Accessibility panel traps nothing; cookie banner covers the buttons on a phone |
| ⬜ | **Admin — products** | 11 | A half-failed save can duplicate colours; saving mid-upload throws the photo away |
| ⬜ | **Admin — everything else** | 10 | A failed save wipes the live home strip; "new question" discards unsaved edits |
| ⬜ | **Magazine & materials** | 6 | The article page is Hebrew-only; an article containing `<` loses its paragraphs |
| ⬜ | **Two leftovers** | 2 | Product headings sit at the wrong level; phone number aligns to the wrong edge |

---

## What you need to do

Nothing here — it's all my side.

Your list is in **[ACTION.md](ACTION.md)**: reviews, colours, real projects.

---

## How this file works

Every time I hit a limit and come back, I update the bar and the two tables
above, so you can open this file and see exactly where things stand without
reading anything else.
