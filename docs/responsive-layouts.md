# Responsive layouts

The responsive update preserves the existing palette, fonts, navigation labels,
catalog imagery and desktop screen design. Original design references are intact.

## Layout behavior

- Below 1024px, navigation stays visible in a second header row. Search, Log and
  Account remain accessible; phones use a search icon and compact Log button.
  `--site-header-height` controls page padding, search positioning and anchor
  offsets: 112px below 1024px and 64px on desktop.
- Phones use the export's mobile headline/display sizes, 16px form text,
  tighter gutters and spacing. Coarse-pointer controls have 44px minimum heights.
  Grids grow from phone columns into tablet and desktop arrangements.
- The home hero grows with its text instead of clipping content inside a fixed
  height. Its buttons wrap. Empty prototype sections do not add phone spacing.
- Game covers are bounded on phones and sit beside details on tablets. Metadata,
  action controls, review headers and sidebar panels wrap without page overflow.
- Rankings wrap category controls and keep long profile names within their
  column. Tier boards adapt their card count and wrap tier shortcuts.
- The rating editor wraps titles, platform buttons, score labels, status controls
  and action buttons. The tier menu stays within the viewport. Long tags wrap.
- Search stays below the header, uses the dynamic viewport height and scrolls
  results within the dialog. Scope controls wrap, and keyboard hints are hidden
  on short screens to leave more room for results. Keyboard navigation remains.
- Comparison profiles stack before desktop widths. Filters wrap, and the ledger
  scrolls within a named, keyboard-focusable region with a scrollbar and phone
  hint. This wide table is deliberately horizontally scrollable.
- Curated lists wrap long names and move ordering controls below game titles on
  phones. Login, footer, 404 and error layouts use the same responsive gutters.

## Verification

An automated Chromium audit covered ten routes at 320×900, 390×844, 640×900,
768×1024, 1024×900, 1440×900, 1920×1080 and 844×390. Every viewport retained all
four main navigation links without document-level horizontal overflow; search
stayed within the visible viewport. Screenshots were visually inspected for
mobile, tablet, desktop and landscape layouts.

Eight populated owner routes were additionally checked at six widths from
320px to 1440px. Fixtures included a 48-character unbroken tag, an 80-character
unbroken list name, a long review, saved play details and ordered list games.
The long-list-name check caught and resolved an anonymous flex-item overflow.

Chrome coarse-pointer emulation verified 44px control heights. Browser flows
verified the tier menu placement, tag editing/Discard, mobile search, Escape
return navigation and the desktop Ctrl+K shortcut. No browser runtime errors
were reported. Typecheck, lint, production build, 17 input/data tests and demo
seed reproducibility pass. The initial build used an isolated local API
fixture. After the tags/lists migration was applied, the production build also
passed against the live Supabase schema.
An additional production-preview server launch was rejected by automatic
approval review as "blocked by policy". Browser checks used the development
server; the optimized build compiled successfully but was not browser-tested.

No real owner data, credentials, infrastructure or deployment settings changed.
The responsive update introduces no dependencies or schema changes. The
required tags/lists migration is applied, and the user authorized production
rollout of both milestones from `main`.
