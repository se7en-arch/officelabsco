// The site-lock bypass cookie holds a SHA-256 of PREVIEW_SECRET, never the secret itself,
// so a leaked cookie does not reveal the password. Uses Web Crypto so it runs in middleware too.
export async function previewToken(secret: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ol-preview:' + secret));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
