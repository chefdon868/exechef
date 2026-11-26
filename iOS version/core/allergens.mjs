// Allergen matrix core: pure logic, no UI, no packages.
// The 14 allergens are the EU/UK major allergens (Regulation (EU) No 1169/2011).
// Safety rule: an ingredient with no allergen record is UNKNOWN, never "none".
// A dish with any unknown ingredient is shown as "check with the kitchen".

export const ALLERGENS = [
  'celery', 'cereals_gluten', 'crustaceans', 'eggs', 'fish', 'lupin', 'milk',
  'molluscs', 'mustard', 'nuts', 'peanuts', 'sesame', 'soya', 'sulphites',
];

export const STATUS = { CONTAINS: 'contains', FREE: 'free', UNKNOWN: 'unknown' };

// ingredients: { [id]: { name, allergens: string[] | null } }
//   allergens === null means "not recorded yet" -> unknown.
// dishes: [{ id, name, ingredients: string[] (ingredient ids) }]
// Returns one row per dish: which allergens it contains, is free of, or is unknown for.
export function buildMatrix(dishes, ingredients) {
  return dishes.map((dish) => {
    const status = {};
    for (const a of ALLERGENS) status[a] = STATUS.FREE;
    const missing = [];

    for (const ingId of dish.ingredients) {
      const ing = ingredients[ingId];
      if (!ing) {
        missing.push(ingId);
        for (const a of ALLERGENS) status[a] = STATUS.UNKNOWN;
        continue;
      }
      if (ing.allergens === null || ing.allergens === undefined) {
        missing.push(ing.name);
        for (const a of ALLERGENS) {
          if (status[a] === STATUS.FREE) status[a] = STATUS.UNKNOWN;
        }
        continue;
      }
      for (const a of ing.allergens) {
        if (!ALLERGENS.includes(a)) {
          throw new Error(`Unknown allergen "${a}" on ingredient "${ing.name}"`);
        }
        status[a] = STATUS.CONTAINS;
      }
    }

    const hasUnknown = missing.length > 0;
    return {
      dishId: dish.id,
      dishName: dish.name,
      status,
      contains: ALLERGENS.filter((a) => status[a] === STATUS.CONTAINS),
      unknownIngredients: missing,
      // Guest-facing summary. Unknown data is never reported as safe.
      guestAdvice: hasUnknown ? 'check_with_kitchen' : 'listed_allergens_only',
    };
  });
}
