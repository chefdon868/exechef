# ExeChef iOS: working brief (draft 1)

Status: draft for discussion. Not yet built. Not yet run through the 5 Day Sprint framework (sign-in pending).

## What it is

A professional recipe card platform for chefs. It replaces the way most kitchens currently manage and pass on recipes, costs and allergens. AI reads and interprets the chef's existing material and turns it into structured, consistent cards.

Core parts, as described by Don:

1. **Front-of-house card**: guest-facing dish description, clear allergen matrix, dietary flags.
2. **Back-of-house card**: method, yield, portions, plating, prep notes.
3. **Photography**: clear, Instagram-quality dish photos.
4. **QR code**: on the table or menu, links to deeper detail on the dish (ingredients, allergens, method, story).
5. **Allergen matrix**: very clear, so staff can advise guests with confidence.
6. **Cost management**: ingredient costs, portion cost, GP%. Later phase.

## Recommendation on scope

Ship the allergen matrix, the FOH card and the QR link first. Cost management and BOH cards come after.

Reasons:
- Allergen safety is the sharpest pain and the clearest reason a chef pays. A wrong allergen answer is a legal and safety problem, so the value is obvious.
- A single, verifiable card with a QR is a complete product on its own. Costing adds a second product with its own data and users.
- It keeps the first iOS build small enough to finish in the five-day sprint.

## Architecture (proposed, to confirm)

- The iOS app is a client. The recipe data, allergen logic and AI reading live on a server that the iOS app and the web app share. Do not store the data only on the phone.
- Allergen data is safety-critical. Every allergen change needs a checked source and a second check before it reaches a guest-facing card.
- Keep the employer's name out of all code, copy and commits.

## Open questions for Don

1. Who is the first paying user: a single restaurant or a hotel group?
2. Which existing app holds the cleanest recipe and allergen data to start from?
3. Is the QR destination a web page (works for any phone) or the app (needs install)? Recommendation: web page first.
4. Which Apple features matter for v1: camera for photos, offline use in the kitchen, sign-in?
5. Skool email for the 5 Day Sprint login (needed before the framework can scaffold).
