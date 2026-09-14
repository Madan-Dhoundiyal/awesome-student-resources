// Shared vocabulary and parsing for the shields.io tag badges appended to
// every resource entry (see CONTRIBUTING.md's "Entry format" section).
// Centralized so export-json.mjs, pricing-review.mjs, and check-list-format.mjs
// agree on the same tag names, colors, and parsing instead of each
// reimplementing a slightly different regex.

// Every entry carries exactly one of these (its price), plus FOSS as an
// additive tag when the resource is also free and open source.
export const PRICING_TAGS = ['free', 'freemium', 'paid'];
export const ALL_TAGS = ['FOSS', ...PRICING_TAGS];

export const TAG_COLORS = {
  FOSS: '3DA639',
  free: '2489CA',
  freemium: 'F5A623',
  paid: 'D33833',
};

export function badgeMarkdown(tag) {
  const color = TAG_COLORS[tag];
  if (!color) throw new Error(`Unknown tag: ${tag}`);
  return `![${tag}](https://img.shields.io/badge/${tag}-${color}?style=flat-square)`;
}

const BADGE_RE = /!\[([^\]]+)\]\([^)]+\)/g;

// Pure: given a raw entry description (everything after "- **[Name](url)** - "),
// split it into { description, tags }. Badges can appear anywhere on the line;
// tag order is preserved as written, and the plain-text description has them
// stripped along with the whitespace that joined them.
export function parseTaggedDescription(rawDescription) {
  const tags = [...rawDescription.matchAll(BADGE_RE)].map((m) => m[1]);
  const description = rawDescription
    .replace(BADGE_RE, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+\./, '.')
    .trim();
  return { description, tags };
}

// Pure: the single pricing tag among `tags`, or null if none is present
// (shouldn't happen once an entry is tagged, but callers stay defensive).
export function pricingTag(tags) {
  return tags.find((t) => PRICING_TAGS.includes(t)) ?? null;
}

// Pure: build the trailing badge string for a tag list, in the order given,
// e.g. buildBadgeSuffix(['FOSS', 'free']) -> '![FOSS](...) ![free](...)'.
export function buildBadgeSuffix(tags) {
  return tags.map(badgeMarkdown).join(' ');
}
