// Accept only a same-site absolute path for post-login redirects.
// Rejects '//host', '/\host' (browsers treat '\' as '/'), encoded variants and anything with whitespace.
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  let decoded: string;
  try { decoded = decodeURIComponent(next); } catch { return null; }
  if (decoded.includes('\\') || next.includes('\\')) return null;
  // Must start with exactly one '/', followed by printable ASCII without spaces.
  if (!/^\/(?![\/\\])[\x21-\x7e]*$/.test(next)) return null;
  return next;
}
