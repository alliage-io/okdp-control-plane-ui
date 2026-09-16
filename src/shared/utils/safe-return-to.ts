// An app-relative path: one leading slash, not followed by another slash or a
// backslash (browsers read `//host` and `/\host` as another origin).
const RELATIVE_PATH = /^\/(?![/\\])/;
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[\\\u0000-\u001f\u007f]/;

function isSafe(path: string): boolean {
  return RELATIVE_PATH.test(path) && !UNSAFE_CHARS.test(path);
}

/** The `returnTo` query parameter, only when it is a path inside the console.
 *  It comes from the URL, so anyone can craft it: an absolute URL,
 *  `javascript:`, a protocol-relative `//evil` or a backslash variant would
 *  send the user off-site (open redirect). Returns null for anything else, and
 *  the caller falls back to its default destination. The value is checked
 *  once more percent-decoded, so an encoded `%5C` or `%2F` cannot slip a
 *  second slash past the router. */
export function safeReturnTo(returnTo: string | null | undefined): string | null {
  if (!returnTo || !isSafe(returnTo)) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(returnTo);
  } catch {
    return null;
  }
  return isSafe(decoded) ? returnTo : null;
}
