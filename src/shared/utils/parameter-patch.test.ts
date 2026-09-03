import { describe, it, expect } from 'vitest';
import { isUnset, mergePatch, sameValue } from './parameter-patch';

describe('sameValue', () => {
  it('compares JSON values structurally, ignoring key order', () => {
    expect(sameValue({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBe(true);
    expect(sameValue([1, 2], [2, 1])).toBe(false);
    expect(sameValue({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(sameValue(0, false)).toBe(false);
  });
});

describe('isUnset', () => {
  it('treats only empty form values as unset', () => {
    expect(isUnset('')).toBe(true);
    expect(isUnset(null)).toBe(true);
    expect(isUnset(undefined)).toBe(true);
    expect(isUnset(0)).toBe(false);
    expect(isUnset(false)).toBe(false);
    expect(isUnset([])).toBe(false);
  });
});

describe('mergePatch', () => {
  it('sends only the changed keys', () => {
    expect(mergePatch({ a: 1, b: 'x' }, { a: 1, b: 'y' })).toEqual({ b: 'y' });
    expect(mergePatch({ a: 1 }, { a: 1 })).toEqual({});
  });

  it('deletes a removed key with null, restoring the chart default', () => {
    expect(mergePatch({ a: 1, metastore: 'hive' }, { a: 1 })).toEqual({ metastore: null });
  });

  it('adds a new key', () => {
    expect(mergePatch({}, { numWorkers: 3 })).toEqual({ numWorkers: 3 });
  });

  it('patches nested objects key by key, since the server merges them', () => {
    expect(
      mergePatch({ roles: { admin: ['a'], viewer: ['v'] } }, { roles: { admin: ['a', 'b'] } }),
    ).toEqual({ roles: { admin: ['a', 'b'], viewer: null } });
  });

  it('replaces arrays whole', () => {
    expect(
      mergePatch(
        { hiveCatalogs: [{ name: 'a' }, { name: 'b' }] },
        { hiveCatalogs: [{ name: 'a' }] },
      ),
    ).toEqual({ hiveCatalogs: [{ name: 'a' }] });
  });
});
