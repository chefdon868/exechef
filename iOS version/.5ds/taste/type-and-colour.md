# Choosing type and colour

How to choose, not what to choose. Every choice is yours, made from the governing idea in `.5ds/taste/art-direction.md`.

## Type
1. **Choose the kind of face first**, from the idea: a roman serif, a grotesk, a humanist sans, a slab, a condensed face, a rounded face, a script, a monospace. Ask what voice the subject speaks in, and what lettering its own world already uses (its signs, labels, packaging, documents).
2. **Try 2 or 3 faces of that kind on the real headline**, at the real size: `node .5ds/taste/shots.mjs --type "the real headline" --faces "A,B,C"` makes 1 image of them. Judge them by their shape on the page. A face's fame, or a cliche about the subject, is not a reason.
3. **1 or 2 families.** If 2, make them clearly different in role and shape. The type itself can be the design: on a showcase page, try the headline very large (a fifth of the screen width or more) with tight leading, and let it carry the page.
4. **Load them from Google Fonts with `next/font/google`** in `web/app/layout.tsx`: the body face as `--font-sans`, a heading face as `--font-heading` (and `--font-heading: var(--font-heading);` inside `@theme inline` in `globals.css`). Use only the weights you use.
5. **Hierarchy by ratio**: the largest text on the first screen at least 3 times the body (`numbers.json` first_screen_ratio), weight and colour doing work too, not size alone. Body text at least `numbers.json` body_min_px; lines of 45 to 75 characters.

### The saturated list
`.5ds/taste/saturated-fonts.json` lists the faces that need a reason from the concept, written in `art-direction.md` next to the face's name; the look check fails a page that loads one with no reason. It holds 2 dated lists with their sources: the 30 most used faces on Google Fonts, and the faces seen most in AI-made sites. Choosing outside both lists is easier than arguing for one inside them.

## Colour
1. **Hue from what the product means, never from its category.** What colour is the subject's own world: its materials, its place, its time of day, its people? Not "blue because it is software".
1b. **Let the subject's world inform the colours, not dress the page**: the real place, the product, its materials, the audience's world (the cafe's sign, the paper of a reading record, the trading screen they already use) feed the idea; a city's brick is not a reason for a brick page. Then keep to 2 or 3 working colours: restraint reads as confidence.
2. **Light or dark from where people use it**: who, where, in what light (a kitchen at 7am, a desk at night, a phone in the sun). Not from the category.
3. **Roles, not swatches.** Name 4 to 6 roles, each with a job and 1 line of reasoning in `art-direction.md`:
   - **canvas**: the main ground.
   - **ink**: the main text.
   - **action**: the main button, links and focus. The colour that owns a deliberate region or job, not a sprinkle of small accents.
   - **accent** (optional): a second colour for 1 role, such as data or a highlight.
   - Others as the idea needs them (a surface for cards, a status colour); `palette.mjs` works out the rest.
4. **Write them as OKLCH** (`oklch(0.62 0.14 48)`: lightness, chroma, hue) or hex. OKLCH keeps lightness even across hues, so ramps and pairs behave.
5. **Put canvas, ink, action and accent in `.5ds/taste/palette.md`** (mark a role that came from an existing logo with `# from the logo`) and run `node .5ds/taste/palette.mjs`. It keeps your chosen colours, works out every other shadcn token in light and dark (cards, muted text, borders, secondary fills, charts, sidebar, ring) from their hues, measures every text and ground pair against `numbers.json` contrast (4.5 to 1 for text, 3 to 1 for large text and controls), and prints the nearest passing value for any pair of yours that fails. The contrast is a check; the hue stays your judgment.
6. **Theme what browsers forget**: text selection, the caret, scrollbars, focus rings, `theme-color` and `color-scheme`, so the browser matches the page.

## Shape and depth
- Pick 1 radius for controls and use it everywhere; nested corners smaller than their parent.
- Shadows, if the idea wants them, in layers (a soft ambient one and a small direct one), tinted with the canvas hue on coloured grounds.
- Borders and dividers in a tint of the canvas, not grey.
