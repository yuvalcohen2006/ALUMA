# Bug sweep — where I'm standing

```
████████████████░░░░  82%
```

**101 of 123 problems fixed. 22 left.**

Last updated: 9 September 2026, third session.

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
| ✅ | **Club & account** | No way back in if you forgot your password; progress bar filled backwards; error messages in English |
| ✅ | **"View in your space"** | Every 3D model was dead — page now hidden, one switch brings it back |
| ✅ | **Admin colours** | Saving while a colour photo uploaded threw the photo away |
| ✅ | **Questionnaire** | Accepted a blank name and a fake phone; Enter did nothing |
| ✅ | **Every button on the site** | Text on the terracotta buttons was below the readable minimum |
| ✅ | **Magazine** | An article with an email address in it lost all its paragraphs |
| ✅ | **Accessibility panel** | Keyboard users fell straight out of it; its text-size button did nothing |
| ✅ | **Shared links** | A link with a `#` in it (from WhatsApp) landed at the top of the page, not the section |

Plus 25 smaller ones: contrast, arrows pointing the wrong way, dead code.

---

## Left to do ⬜

| | Area | How many | What's in there |
|---|---|---|---|
| ⬜ | **Admin — products** | 10 | A half-failed save can duplicate colours; a failed reorder is neither reported nor undone |
| ⬜ | **Admin — everything else** | 10 | A failed save wipes the live home strip; "new question" discards unsaved edits |
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
