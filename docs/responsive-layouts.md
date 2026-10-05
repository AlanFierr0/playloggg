# Responsive layouts

The responsive update preserves the existing palette, fonts, navigation labels,
catalog imagery and desktop screen design. Original design references are intact.

## Layout behavior

- The approved UI design update uses a 64px header at all widths. Below 1280px,
  a native Navigation menu disclosure contains all five destinations and display
  preferences. Search, Log and Account remain directly accessible; phones use
  a search icon and compact Log button. `--site-header-height` controls page
  padding, search positioning and anchor offsets. See `ui-design-improvements.md`.
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
mobile, tablet, desktop and landscape layouts. This historical audit preceded
the fifth Games navigation link and the display-preference header row.

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

## Wide-screen correction

The first responsive audit checked navigation and overflow but missed the fixed
1280px maximum width on wide monitors. Shared `site-container` layouts now keep
the original desktop sizing through 1440px and expand smoothly up to 1792px. At
1920px the container is 1760px; the header, page sections and footer align. The
home spotlight height scales on wide screens, and portrait editorial cards use
the reviewed cover rather than cropping landscape artwork.

A follow-up browser audit passed nine routes at 320, 768, 1280, 1440, 1920 and
2560px (54 route/viewport checks). It also checks that the wide container and
spotlight actually grow. Desktop/mobile screenshots were visually inspected.
No browser runtime errors were reported; typecheck, lint and production build
pass. These checks used the local development server with the live read-only
catalog; no owner records were changed.

Update (2026-10-01): the user removed Command/Ctrl+K search activation and its
header hint. Search still opens through the accessible header link, and keyboard
selection, Tab navigation and Escape inside the search dialog remain available.

The shared shell uses a column flex layout with a minimum height of 100dvh.
Main content fills unused viewport space, keeping the footer at the bottom on
short pages. Long pages scroll naturally with the footer after their content;
the footer does not cover controls or remain fixed while scrolling.

The user removed the homepage Editor’s Spotlight section. Discover now opens
with its page heading followed by the existing Essential Canon game cards;
the spotlight artwork, copy, actions and reserved hero height are removed.

The profile overview separates identity and statistics from owner tools and
section navigation. Owner tools use spaced rounded buttons; section tabs use a
two/three/six-column grid with a contrasting current tab. Favorites, taste,
recent entries, reviews and lists have distinct rounded panels. The secondary
panels use two columns on wide screens and stack on smaller screens. Sharing
controls belong to the favorites panel. Layout checks cover non-overlapping
controls, 44px minimum touch targets, active tabs and navigation; screenshots
cover desktop, tablet and mobile using isolated test profiles.
