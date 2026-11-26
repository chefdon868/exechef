import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMatrix, ALLERGENS, STATUS } from './allergens.mjs';

const ingredients = {
  flour: { name: 'Wheat flour', allergens: ['cereals_gluten'] },
  egg: { name: 'Egg', allergens: ['eggs'] },
  salt: { name: 'Salt', allergens: [] },
  butter: { name: 'Butter', allergens: ['milk'] },
  mystery: { name: 'House stock', allergens: null },
};

test('lists every allergen as free, contains or unknown', () => {
  const [row] = buildMatrix([{ id: 'd1', name: 'Pancake', ingredients: ['flour', 'egg', 'salt'] }], ingredients);
  assert.equal(Object.keys(row.status).length, ALLERGENS.length);
  assert.equal(row.status.eggs, STATUS.CONTAINS);
  assert.equal(row.status.cereals_gluten, STATUS.CONTAINS);
  assert.equal(row.status.milk, STATUS.FREE);
  assert.deepEqual(row.contains, ['cereals_gluten', 'eggs']);
  assert.equal(row.guestAdvice, 'listed_allergens_only');
});

test('an ingredient with no allergen record makes its dish unknown, never safe', () => {
  const [row] = buildMatrix([{ id: 'd2', name: 'Soup', ingredients: ['butter', 'mystery'] }], ingredients);
  assert.equal(row.status.milk, STATUS.CONTAINS);
  assert.equal(row.status.nuts, STATUS.UNKNOWN);
  assert.equal(row.status.eggs, STATUS.UNKNOWN);
  assert.deepEqual(row.unknownIngredients, ['House stock']);
  assert.equal(row.guestAdvice, 'check_with_kitchen');
});

test('an ingredient id that does not exist is treated as unknown', () => {
  const [row] = buildMatrix([{ id: 'd3', name: 'Broken', ingredients: ['ghost'] }], ingredients);
  assert.equal(row.status.peanuts, STATUS.UNKNOWN);
  assert.deepEqual(row.unknownIngredients, ['ghost']);
  assert.equal(row.guestAdvice, 'check_with_kitchen');
});

test('a misspelt allergen key is rejected loudly, not ignored', () => {
  const bad = { x: { name: 'Typo', allergens: ['gluten'] } };
  assert.throws(() => buildMatrix([{ id: 'd4', name: 'T', ingredients: ['x'] }], bad), /Unknown allergen/);
});

test('one row per dish, in order', () => {
  const rows = buildMatrix(
    [
      { id: 'a', name: 'A', ingredients: ['egg'] },
      { id: 'b', name: 'B', ingredients: ['salt'] },
    ],
    ingredients,
  );
  assert.deepEqual(rows.map((r) => r.dishId), ['a', 'b']);
  assert.deepEqual(rows[1].contains, []);
});
