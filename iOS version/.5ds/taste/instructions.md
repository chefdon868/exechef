# Taste

Read this before you build or change any screen. You are the designer here, and the job is to make something beautiful. Nothing in this part picks a look for you: no house colours, no house font, no preset styles. It gives you a way of working, Omar's craft, a floor, and checks. Omar's craft (`.5ds/taste/craft.md`) is the same in every project; the look is this product's own. The look comes from what this product is for, and it should be one nobody would mistake for another product. How the app feels to use (taps, states, motion) is in `.5ds/animations/instructions.md` (if `.5ds/animations` is missing, run `npx @5daysprint/framework install animations`).

## Why this matters
Left to itself, a model fills every open choice with its most likely answer, and it cannot see its own habit. Avoiding those habits is not the goal; it only gets you to "different". The goal is work that could sit next to the best in its field. So: set the bar from real work first, find 1 confident idea, build 1 moment people remember, then look at your page beside the bar and fix it.

## The art direction, before any screen
Write it in `.5ds/taste/art-direction.md` (the owner's file; keep the line shapes of its template, the look check reads them). 6 steps:
1. **The subject.** Name what it is, who it is for, the visitor's 1 job, and the real material you can show. Ask once for what already exists: a logo, brand colours, faces, photos, past materials. When they exist, the governing idea says what it keeps, and `palette.md` marks the roles that came from the logo.
2. **Set the bar.** Find 3 to 5 of the best real sites or apps in this field, made by studios at the top of their craft: search Awwwards, Godly and the other galleries in `.5ds/taste/inspiration.md`, or the live web. Open each (`node .5ds/taste/shots.mjs --ref --url <address>` shoots it) and write, for each, why it is beautiful: the idea, the type, the colour discipline, the motion, the rhythm, the small details. They set the level of craft, never a look to copy.
3. **The rut.** Write down the page you would make anyway, and its obvious twist. Neither ships. Note which of the lazy defaults in `.5ds/taste/notice.md` you were about to use.
4. **Go wide.** Gather what the audience knows by heart (its places, objects, print, tools and rituals). They feed the idea; they are not decoration. Never draw the subject's things literally (a roofline because of the name, bricks because of the city): that is costume. Turn it into 2 or 3 directions, each a concept a top studio would pitch, set on 4 axes: **ground** (light, dark, colour or photo), **type** (the kind of face), **structure** (centred, left, editorial or grid) and **density** (airy, standard or dense). Every 2 directions differ on at least 3 axes.
5. **Pick 1 governing idea, and 1 signature moment.** The idea: 1 sentence, true of this product and no other, that decides colour, type, layout and motion all the way down. The signature moment: the 1 thing a visitor will remember and describe to a friend, such as a headline that builds as you scroll, the work moving inside the type, or a page that changes ground from section to section. It gets the most care. Keep the rest disciplined.
6. **Write it down.** 4 to 6 colour roles, each with 1 line of reasoning tied to the idea; the faces and the scale; the shape of controls, borders, shadows and focus, within the craft in `.5ds/taste/craft.md` (that is what makes it more than recoloured shadcn); the density and the spacing steps it uses; the pictures (kind and treatment, icon set and weight); the voice (3 words and 1 example button label); the first screen structure; the motion feel. Then the competitor test, as evidence: name the product this could pass as, and the 1 change that stops it.

## What the best work has in common
- 1 confident idea, carried into every detail.
- Type as a hero where it fits: very large, tight leading, set with care.
- 2 or 3 colours, used with discipline.
- Rhythm: quiet space, then a big moment; sections that change pace or ground.
- Motion with personality on a showcase page (`.5ds/animations/motion.md`, Showcase pages).
- Small finishing details: a location line, tiny labels, a considered footer, real hover states.
- Missing pictures are placeholders in the right shape and ratio, part of the composition; never grey boxes with an icon.

## Show the owner, let them pick
Show the directions in 1 short message: their 4 axes, 2 lines each, the signature moment of each, what makes each right for their people, and your recommendation. They pick or mix. If they say "you choose", still show them in that 1 message, then pick and say why in 1 line. The Picked line quotes the owner's own words; the look check fails it without them.

## When the owner says it looks generic
Go back to step 4. Change the ground, the type kind and the structure together, never only a colour. Write the rejected direction and their words under "Rejected", so it is never offered again.

## Turning it into the app
- **Colour.** Put canvas, ink, action and an optional accent in `.5ds/taste/palette.md`, then run `node .5ds/taste/palette.mjs`. It works out every other token, light and dark, measures every text and ground pair, and writes the theme. How to choose: `.5ds/taste/type-and-colour.md`.
- **Type.** Choose the kind of face the idea calls for, then run `node .5ds/taste/shots.mjs --type "the real headline" --faces "A,B,C"` to see 2 or 3 candidates on the headline at real sizes. Load the pick with `next/font`. A face in `.5ds/taste/saturated-fonts.json` needs its reason by name.
- **Shape.** Set the radius, borders, shadows and focus style in `globals.css` as the art direction's Shape section and `.5ds/taste/craft.md` say. Never ship shadcn's defaults as they are; the look check flags a theme where only the colours changed.
- **Structure.** Only when choosing a structure, read `.5ds/taste/layouts.md`: widths, gaps and order, never looks. The order follows the visitor's 1 job.

## The floor (holds for every look)
- **Tokens only.** Every colour, font and radius is a token; screens read tokens, never raw colour codes.
- **Real content.** Real words, photos and numbers. No lorem ipsum, no invented metrics or testimonials.
- **Breathing room.** 1 spacing scale (`numbers.json` spacing_px, printed in `web.md`); start with too much, then remove.
- **Hierarchy.** The largest text on the first screen is at least 3 times the body (`numbers.json` first_screen_ratio), and the home headline is at least 44px on a phone (hero_headline_px.phone_min).
- **Every state.** Empty, loading, loaded, error and done, for every screen and list.
- **Accessible.** Contrast 4.5 to 1 for text, 3 to 1 for large text and controls (`numbers.json` contrast); targets at least 44px (touch_min_px, the framework's floor); a visible focus ring; labels on every field; works with larger text and Reduce Motion.

## The platform guide
Read only the guide for the platform you are building: `web.md` (websites and web apps, the default), `ios.md`, `macos.md`, `android.md`, or `cross-platform.md` then each target's guide. Before its first screen, run `node .5ds/taste/sources.mjs`: it reads the latest official pages and writes 1 line per platform to `.5ds/taste/notes.md`; a newer official page wins. For anything else (Windows, Apple Watch, Vision Pro, a browser extension, an installable web app, an email), fetch that platform's own official guidelines, keep this floor, and tell the owner in 1 line.

## The beauty pass, after the build
With the app running, run `node .5ds/taste/shots.mjs` and open the 1280 and 375 shots beside the shots of your references. Ask: would this sit next to them? Does it carry the house craft (`.5ds/taste/craft.md`, The craft test)? What would a top studio change? Fix the 3 biggest things (usually scale, spacing, rhythm or the signature moment), shoot again, and write the before, the after and the Craft line under "Beauty pass" in `art-direction.md`. If the answer is still no, do 1 more round.

## Before you show a screen
Run `node .5ds/taste/look.mjs`. Besides the screens, it checks the art direction is written, picked in the owner's words and reasoned, with its bar, its signature moment and its beauty pass with its Craft line; that no screen uses letter-spaced capitals and the home headline is set tight; that the text selection is styled; that saturated faces have their reason; that the look is not a lazy default (`seen.json`: a look seen everywhere passes once you write why it is a choice here) and does not repeat another of your projects on 3 of 5 axes (it keeps their fingerprints on this computer, in `~/.5ds/looks.ndjson`); and that shadcn was restyled beyond colour. Then `.5ds/taste/checklist.md`. Show it with 1 line on what to look at and 1 line on anything you could not check.
