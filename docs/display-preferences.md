# Display preferences

Changes on `main` deploy automatically through Vercel.

The header offers light/dark and English/Español (Argentina) controls at desktop
and phone widths. English and the original dark design remain the defaults.
Each preference is stored in a first-party, year-long cookie. URLs stay the same.

## Explicit translations

`src/lib/locale/es-AR.json` remains the shared dictionary. Client components use
`useMessages()`; server components and metadata use the request-scoped
`getMessages()` helper. Interface copy, accessible labels, metadata, form errors,
status messages and dynamic counts are translated explicitly. No document text
walker or MutationObserver changes rendered copy.

The server renders ordinary Spanish pages and metadata from the language cookie.
Language switching writes the cookie, updates the preference context and refreshes
server-rendered content with `router.refresh()`. React retains filters, drafts,
and other client state. Game titles, company names, genres supplied by IGDB,
profile names, list names, tags and personal reviews remain in their source
language. Dynamic accessible labels translate the surrounding UI phrase while
preserving the embedded title or tag.

The exceptional global error screen replaces a failed root layout. Next requires
that screen to be a Client Component, so its initial HTML uses the default
language/theme; React reads saved cookies after hydration. Ordinary pages and
route error screens use the selected preferences without that fallback delay.

## Accessibility

Light mode reuses the existing Stitch color roles. The featured artwork keeps its
dark treatment and matching button text. Search labels, pagination text and editor
hints use readable foreground roles. Keyboard focus remains visible on form
fields, a skip link targets the main content, decorative icons are hidden from
screen readers, and reduced motion limits animations to one iteration. The blurred
search backdrop is inert; the actual search dialog remains interactive.

The development-only `@axe-core/playwright` audit covers guest and authenticated
routes in both languages and themes, at desktop and phone widths. Browser tests
also cover Spanish HTML/metadata with JavaScript disabled, filter/draft preservation,
keyboard focus, dialog Tab wrapping and reduced motion. Fixtures do not verify
production authentication or RLS. Automated checks are not a full accessibility
certification. No runtime translation dependency, external translation request or
database migration is needed.

Verification: production build, TypeScript, lint, 43 Node tests and 30 browser
checks pass. The browser suite runs at desktop and phone widths and includes
all four theme/language accessibility combinations.
