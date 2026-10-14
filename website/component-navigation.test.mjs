import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { componentHref, selectionFromLocation, searchExampleIds } from './component-navigation.mjs';

const examples = JSON.parse(readFileSync(new URL('./component-examples.json', import.meta.url)));
const inventory = JSON.parse(readFileSync(new URL('./component-inventory.json', import.meta.url)));
const groups = Object.keys(inventory).map(id => ({ id, label: id === 'forms' ? 'Buttons & forms' : id }));

test('every indexed export, including compound parts, survives a cold deep link', () => {
  for (const name of Object.values(inventory).flat()) {
    assert.ok(Object.hasOwn(examples, name), name);
    const url = new URL(componentHref(name, examples), 'https://ui.opcorbit.com');
    assert.equal(selectionFromLocation(url, examples), name);
  }
});

test('legacy example anchors still resolve, while unknown selections cannot override them', () => {
  const anchor = examples.SelectTrigger;
  for (const query of ['', '?component=Unknown', '?component=__proto__']) {
    const selected = selectionFromLocation(new URL(`/components${query}#${anchor}`, 'https://ui.opcorbit.com'), examples);
    assert.equal(examples[selected], anchor);
  }
  assert.equal(selectionFromLocation(new URL('/components', 'https://ui.opcorbit.com'), examples), null);
  assert.throws(() => componentHref('__proto__', examples));
});

test('compound-part search returns only its own composed example', () => {
  assert.deepEqual(searchExampleIds('SelectTrigger', groups, inventory, examples), [examples.SelectTrigger]);
  assert.deepEqual(searchExampleIds('missing-export', groups, inventory, examples), []);
});

test('a collection-label search includes the collection rather than unrelated examples', () => {
  const expected = [...new Set(inventory.forms.map(name => examples[name]))].sort();
  assert.deepEqual(searchExampleIds('buttons & forms', groups, inventory, examples).sort(), expected);
});
