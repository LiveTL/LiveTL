/**
 * Resolves `{{mv2}}.` / `{{mv3}}.` key prefixes in the manifest against the
 * target manifest version, dropping keys tagged for the other one.
 *
 * Browser tags (`{{chrome}}.` / `{{firefox}}.`) are deliberately left in place:
 * vite-plugin-web-extension resolves those itself from its `browser` option.
 *
 * Both resolvers only match a *leading* prefix, so the MV tag has to come first
 * — `{{mv3}}.{{firefox}}.background`, never `{{firefox}}.{{mv3}}.background`.
 * The reverse order leaves a literal `{{mv3}}.` key in the emitted manifest.
 */

const mvTag = /^\{\{mv([23])\}\}\./;

export const resolveMv = (value: any, mv: 2 | 3): any => {
  if (Array.isArray(value)) return value.map(item => resolveMv(item, mv));
  if (typeof value !== 'object' || value === null) return value;

  const resolved: Record<string, any> = {};
  for (const [key, child] of Object.entries(value)) {
    const tag = key.match(mvTag);
    if (tag && parseInt(tag[1], 10) !== mv) continue;
    resolved[tag ? key.slice(tag[0].length) : key] = resolveMv(child, mv);
  }
  return resolved;
};
