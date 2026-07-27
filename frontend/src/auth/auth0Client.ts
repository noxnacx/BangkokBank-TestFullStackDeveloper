import { Auth0Client } from '@auth0/auth0-spa-js'

// `cacheLocation: 'memory'` is the library default already, but it's spelled
// out here on purpose: the access token must never touch localStorage or
// sessionStorage. Both are plain JS-readable storage, so any XSS on this
// page (a compromised dependency, an injected script) can read them and
// exfiltrate the token. An in-memory variable can still be read by an XSS
// payload running in the same page, but it doesn't survive a page
// reload/new tab the way storage does, so a token leak this way can't be
// replayed later or from elsewhere -- it shrinks the blast radius rather
// than closing it entirely (nothing client-side fully closes it against a
// determined XSS). The real backstop against XSS is CSP + not rendering
// unsanitized input, not where the token lives.
export const auth0Client = new Auth0Client({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  cacheLocation: 'memory',
  authorizationParams: {
    redirect_uri: `${window.location.origin}/callback`,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  },
})
