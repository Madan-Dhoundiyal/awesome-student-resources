import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseResources, buildResourcesData } from './export-json.mjs';

test('parses name, url, description, pricing, and tags', () => {
  const readme = `## Alpha

- **[Apple](https://a.example)** - Does apple things ![free](https://img.shields.io/badge/free-2489CA?style=flat-square).
`;
  const resources = parseResources(readme);
  assert.deepEqual(resources, [
    {
      name: 'Apple',
      url: 'https://a.example',
      description: 'Does apple things',
      pricing: 'free',
      tags: ['free'],
      section: 'Alpha',
      subsection: null,
    },
  ]);
});

test('parses a FOSS entry with two badges', () => {
  const readme = `## Alpha

- **[Apple](https://a.example)** - Does apple things ![FOSS](https://img.shields.io/badge/FOSS-3DA639?style=flat-square) ![free](https://img.shields.io/badge/free-2489CA?style=flat-square).
`;
  const resources = parseResources(readme);
  assert.deepEqual(resources[0].tags, ['FOSS', 'free']);
  assert.equal(resources[0].pricing, 'free');
  assert.equal(resources[0].description, 'Does apple things');
});

test('handles an entry with no badge at all', () => {
  const readme = `## Alpha

- **[Apple](https://a.example)** - Does apple things.
`;
  const resources = parseResources(readme);
  assert.equal(resources[0].pricing, null);
  assert.deepEqual(resources[0].tags, []);
  assert.equal(resources[0].description, 'Does apple things');
});

test('tracks the nearest ### subsection, reset by the next ##', () => {
  const readme = `## Alpha

### Fruit

- **[Apple](https://a.example)** - x ![free](https://img.shields.io/badge/free-2489CA?style=flat-square).

## Beta

- **[Banana](https://b.example)** - y ![free](https://img.shields.io/badge/free-2489CA?style=flat-square).
`;
  const resources = parseResources(readme);
  assert.equal(resources[0].section, 'Alpha');
  assert.equal(resources[0].subsection, 'Fruit');
  assert.equal(resources[1].section, 'Beta');
  assert.equal(resources[1].subsection, null);
});

test('ignores bullets before any heading', () => {
  const readme = `- **[Orphan](https://o.example)** - x ![free](https://img.shields.io/badge/free-2489CA?style=flat-square).

## Alpha

- **[Apple](https://a.example)** - y ![free](https://img.shields.io/badge/free-2489CA?style=flat-square).
`;
  const resources = parseResources(readme);
  assert.equal(resources.length, 1);
  assert.equal(resources[0].name, 'Apple');
});

test('buildResourcesData filters out non-content sections like More from StudentSuite', () => {
  const readme = `## Alpha

- **[Apple](https://a.example)** - x ![free](https://img.shields.io/badge/free-2489CA?style=flat-square).

## More from StudentSuite

- **[Sibling List](https://sibling.example)** - y ![free](https://img.shields.io/badge/free-2489CA?style=flat-square).
`;
  const resources = buildResourcesData(readme);
  assert.equal(resources.length, 1);
  assert.equal(resources[0].name, 'Apple');
});
