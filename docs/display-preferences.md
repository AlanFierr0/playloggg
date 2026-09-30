# Display preferences

Changes on `main` deploy automatically to production through Vercel.

The header offers a light/dark toggle and an English/Español (Argentina)
toggle, including at phone widths. English and the original dark design remain
the defaults. Each choice is saved in a first-party, year-long cookie for guests
and signed-in people. The server reads both cookies for the root language
attribute and color scheme on reload; the browser applies UI translations and
keeps them current after navigation and interactive updates. Existing URLs,
account access and stored game data are unchanged.

Light mode maps the existing Stitch color roles to a contrasting light palette.
The featured artwork keeps its dark treatment for readable text. The Spanish
dictionary contains interface labels, form text, navigation, status messages
and editorial copy. It uses Argentine choices for common actions such as
"Explorá", "Buscá" and "Registrá". Game titles, company names, icon ligatures
and user-authored content stay in their original language. IGDB catalog
metadata that has no curated Spanish equivalent also stays as supplied by IGDB.
Translations run after hydration; the first server response still includes the
original English interface copy before the browser applies the selected Spanish
locale. This avoids changing the application's routes or data model, but a brief
English flash is possible on a cold load.

Verification: `pnpm typecheck`, `pnpm lint`, `pnpm build` and all 37 Node tests
pass. Browser checks cover both toggles, saved cookies, cross-route persistence,
320px phone, 1024px tablet and 1440px desktop layouts, icon/game-title preservation
and theme colors. No new package,
database migration or external translation request is needed at runtime.
