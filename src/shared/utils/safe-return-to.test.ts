import { describe, it, expect } from 'vitest';
import { safeReturnTo } from './safe-return-to';

describe('safeReturnTo', () => {
  it('keeps a path inside the console', () => {
    expect(safeReturnTo('/projects/x')).toBe('/projects/x');
    expect(safeReturnTo('/projects/x/trino?status=Failed&q=a%20b')).toBe(
      '/projects/x/trino?status=Failed&q=a%20b',
    );
  });

  it('refuses an empty value', () => {
    expect(safeReturnTo(null)).toBeNull();
    expect(safeReturnTo(undefined)).toBeNull();
    expect(safeReturnTo('')).toBeNull();
  });

  it('refuses protocol-relative and backslash paths', () => {
    expect(safeReturnTo('//evil.example')).toBeNull();
    expect(safeReturnTo('/\\evil.example')).toBeNull();
    // What URLSearchParams.get() returns for ?returnTo=/%5Cevil.example
    expect(
      safeReturnTo(new URLSearchParams('returnTo=/%5Cevil.example').get('returnTo')),
    ).toBeNull();
    expect(safeReturnTo('/projects/x\\y')).toBeNull();
  });

  it('refuses paths that only turn off-site once decoded', () => {
    expect(safeReturnTo('/%5Cevil.example')).toBeNull();
    expect(safeReturnTo('/%2Fevil.example')).toBeNull();
    expect(safeReturnTo('/%E0%A4%A')).toBeNull();
  });

  it('refuses absolute URLs and scripts', () => {
    expect(safeReturnTo('javascript:alert(1)')).toBeNull();
    expect(safeReturnTo('http://evil.example')).toBeNull();
    expect(safeReturnTo('https://evil.example/projects/x')).toBeNull();
    expect(safeReturnTo('projects/x')).toBeNull();
  });

  it('refuses control characters', () => {
    expect(safeReturnTo('/\t/evil.example')).toBeNull();
    expect(safeReturnTo('/projects/x\n')).toBeNull();
    expect(safeReturnTo('/projects/%00x')).toBeNull();
  });
});
