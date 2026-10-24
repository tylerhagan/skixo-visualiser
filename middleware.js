import { next } from '@vercel/functions';

// Password gate for the whole site (page, artwork, everything) except the public case study.
// Set SITE_PASSWORD (and optionally SITE_USER) in Vercel: Project → Settings → Environment Variables.
// Until SITE_PASSWORD is set, the site stays locked.
export const config = { matcher: '/((?!case-study(?:/|$)).*)' };

function same(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export default function middleware(request) {
  const pass = process.env.SITE_PASSWORD;
  const user = process.env.SITE_USER || 'skixo';
  if (!pass) {
    return new Response('Locked. Add SITE_PASSWORD in the Vercel project settings, then redeploy.', { status: 503 });
  }
  const header = request.headers.get('authorization') || '';
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const i = decoded.indexOf(':');
      if (i > -1 && same(decoded.slice(0, i), user) && same(decoded.slice(i + 1), pass)) return next();
    } catch (e) { /* fall through */ }
  }
  return new Response('Sign in to use the skixO visualiser.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="skixO visualiser", charset="UTF-8"' }
  });
}
