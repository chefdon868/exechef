# Omar's craft

How Omar builds, in every project. Apple's apps all feel made by Apple and still look different: the aim. The craft is the hand: corners, type, space, lines, motion. The look (colour, font, mood, pictures, ground, structure) stays this product's own, from the art direction. The owner's words win. On iPhone, Mac or Android the platform guide's numbers win.
Numbers: the `craft` block of `numbers.json`. Motion numbers: `.5ds/animations/numbers.json`.

## Corners
- Big surfaces 24 to 32px (radius_px.surface), cards 16 to 24px (radius_px.card). Pick 1 of each.
- Concentric: inner radius = outer radius minus the gap. Touching parts share 1 corner.
- A section that changes ground can sit as a rounded card inset 4 to 8px on a phone, 12 to 16px on a laptop (inset_px), the ground showing round it, where it serves the idea.

## Controls
- Buttons, tags, tabs and search fields are pills, fully round.
- Main button 44px tall (pill_px.primary) with 20px each side (pill_pad_x_px); compact 36px; tabs 28px. The tap area stays 44px (touch_min_px) through padding. Fields 16px text on phones (field_px_phone), so nothing zooms.
- A secondary button is a soft fill, never a grey outline.

## Type
- Big type is set tight. From 64px (type_px.display_min): leading 0.86 to 0.95 and tracking -0.05 to -0.03em. From 32px (type_px.headline_min): leading 0.95 to 1.05 and tracking -0.035 to -0.02em. Titles -0.02 to -0.01em. A condensed face needs less.
- Around it, small and calm ("a tad cuter beats big"): controls 13 to 14px (type_px.ui), small print 11 to 13px (type_px.meta), body 15 to 18px (type_px.body) at leading 1.55 to 1.7.
- 2 weights (weights): a regular or medium, and a semibold.
- Grey text is the ink at lower strength: 85 to 90 percent strong, 55 to 65 percent body (text_opacity). Text people read keeps 4.5 to 1 (contrast); 40 percent is for what is not read, like a watermark (text_opacity.faint).
- Never letter-spaced capitals. Small labels are normal case.
- A lead under a headline is 440 to 640px wide (lead_column_px). Changing numbers use tabular figures.

## Space
- Sections 64px top and bottom on a phone, 96px on a laptop (section_pad_px), or more.
- Quiet space, then 1 big moment.
- At 1280 the first screen is composed, never a phone column floating in white; an empty screen shows its full state as a preview.

## Colour, lines and depth
- 1 colour leads, used big at least once: a section, a card, a band or the ground. Where, and any second colour, is the art direction's choice.
- Hairlines, not shadows: 1px at 6 to 10 percent of the ink (hairline_opacity). At most 1 shadow style (shadows_max), soft.
- Text selection in the leading colour. Focus is a crisp edge in the leading colour or the ink, never a glow.

## Motion
Soft and staggered, nothing jumps, closing as smooth as opening, text and digits roll. Smooth or it goes. Numbers and recipes: `.5ds/animations/motion.md` and `.5ds/animations/patterns.md`.

## Omar's moves (pick at most 2, from the idea)
- A live object inside the headline: a toggle, a pill or a tiny clip.
- 1 word that carries the meaning, in the leading colour, a gradient or rolling between words.
- The product shot bleeding off its card.
- The ground colour shifting as the page scrolls.
- The main button that morphs into a circle spinner and back.
- A faint grain over the ground, barely seen, for depth.
- A floating pill nav that arrives once the page scrolls.
- Sections that reveal with a soft blur.

## The craft test
Name your moves on the Moves line of the art direction. Shoot the page (`node .5ds/taste/shots.mjs`), check each heading above, and write what you checked and fixed on the Craft line under "Beauty pass", naming at least 2 numbers you used.
