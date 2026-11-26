# Structures

Read this only when you are choosing a structure. It holds widths, heights, gaps, counts and order, nothing else: every colour, shape, picture treatment and decoration comes from your art direction. The rule under all of them: **the order follows the visitor's 1 job**. Put what that job needs first, and cut any section that does not serve it. Every order below is 1 example of many; invent one when none fits.

Spacing values are steps of the scale in `web.md` (`numbers.json` spacing_px): 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128. Web widths are for a 1440px laptop.

## Page structures

### Editorial, 1 column
For writers, studios, essays, a single story. 1 text column 560 to 720px wide (`numbers.json` text_column_px), pictures that break out to the full container (up to 1280px). Paragraph gap 24px; section gap 64 to 96px. The first screen is the title and the first lines of the story; navigation is a short row at the top.

### Catalogue grid
For shops, menus, collections, listings. A filter row 48px tall, then a grid: 2 columns on phones, 3 to 4 on laptops, gap 16 to 24px. Each item: the picture, the name, 1 line, the price. The first screen is the grid itself, not a banner above it.

### Photo-led place
For cafes, venues, hotels, places. The first screen is the place: 1 picture across the full width, with the name, the hours and the 1 action (book, find us, order) over or under it. Then, in the order visitors ask: what is here, when, where, how to book. Section gap 64 to 96px.

### Tool-first
For calculators, generators, converters, any product whose job is done on the page. The tool is the first screen: its input visible without scrolling, the result beside or under it. Explanation, proof and pricing come after, for those who scroll.

### Product page (1 example of a software landing page)
Nav 64 to 72px tall. A first screen with the headline, 1 line, the 1 action, and the real product. Then proof, how it works, pricing, a closing action, the footer. Sections 64 to 80px apart on phones, 96 to 128px on laptops; each heading, then 48 to 64px to its content.

### Booking
Steps: what, when, details, confirm, with the step count shown. The service list in 1 or 2 columns; time as a week grid (morning, afternoon, evening); a summary about 300px wide fixed beside the steps on laptops, a bar at the bottom on phones; the confirmation offers "Add to calendar" first.

### Form page
1 column 360 to 420px wide. Title, 1 line of reason, fields at least 44px tall (`numbers.json` touch_min_px) and 16px apart, labels above, 1 full width action 24px below the last field. Long forms in sections 32px apart.

## App structures

### App shell
On laptops: a sidebar 240 to 256px wide, a top bar 56 to 64px tall with the screen title and its 1 main action, content padding 24 to 32px, content up to 1280px. On phones: the sidebar becomes a sheet, or a bottom tab bar for 3 to 5 places.

### Dashboard home
The greeting or the date, then the 1 thing to do now, then the rest. Cards 20 to 24px padding, 24px gap. A getting started list until it is done.

### Data table
A header row: title, search (40px tall, 240 to 320px wide), filters, the main action. Rows 48 to 56px tall, 16px cell padding across, numbers right aligned and tabular. A row opens a side sheet about 480px wide. Paging at the bottom with the count. Empty: the empty state inside the table. Loading: 8 skeleton rows the same height. On phones, rows become stacked items with 2 key values.

### Empty state
Centred a little above the middle: a small picture or icon, a title, 1 line saying what will appear and why, and the 1 action that fills it, 24px below.

## Phone structures

### Tab bar
3 to 5 places, the platform's own bar. The main action, when there is 1, is a separate button, never a tab.

### Sheet
A grabber, a title, the content, the main action pinned at the bottom (52 to 56pt tall, 16pt from the sides). Options as rows 56pt tall.

### Onboarding
1 question per screen, 3 to 5 answers as rows 64pt tall and 12pt apart, progress at the top, a way back. It ends on the real home screen with 1 starter item in it.

### Settings
Grouped lists, rows 44 to 52pt (Android 56dp single line, 72dp two lines), 32pt between groups.

## Structures from notice.md
These 2 are common enough to be habits (`.5ds/taste/notice.md`). Use them only with a reason from the concept, written in `art-direction.md`:
- A centred first screen with a badge, a headline, 2 buttons and a product picture.
- A row of 3 equal cards, each an icon, a title and 2 lines.
