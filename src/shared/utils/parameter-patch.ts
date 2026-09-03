/* What the console writes to an instance's values.yaml must look like a
   hand-written GitOps file: only the values someone chose, so the chart
   defaults keep applying (and keep following the chart on upgrade). These
   helpers compute that set for a deploy, and the JSON Merge Patch (RFC 7386)
   an edit sends. */

type Params = Record<string, unknown>;

function isPlainObject(value: unknown): value is Params {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Structural equality of JSON values; object key order does not matter. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => sameValue(item, b[i]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a);
    return (
      keys.length === Object.keys(b).length &&
      keys.every((k) => Object.prototype.hasOwnProperty.call(b, k) && sameValue(a[k], b[k]))
    );
  }
  return false;
}

/** An empty form value means "not set", never "set to empty". */
export function isUnset(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

/**
 * JSON Merge Patch (RFC 7386) turning `original` into `next`: changed keys
 * carry their new value, removed keys carry null (the server deletes them and
 * the chart default applies again), nested objects are patched key by key
 * since the server merges them, and arrays are replaced whole. Unchanged keys
 * are left out, so an edit sends only what changed.
 */
export function mergePatch(original: Params, next: Params): Params {
  const patch: Params = {};
  for (const [key, value] of Object.entries(next)) {
    const before = original[key];
    if (sameValue(before, value)) continue;
    patch[key] = isPlainObject(before) && isPlainObject(value) ? mergePatch(before, value) : value;
  }
  for (const key of Object.keys(original)) {
    if (!Object.prototype.hasOwnProperty.call(next, key)) patch[key] = null;
  }
  return patch;
}
