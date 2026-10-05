# UI design improvements

The approved design review calls for a clearer demonstration of gaming identity,
usable mobile navigation, quieter catalog metadata and actionable empty states.
Keep the existing amber/dark identity, light theme, typography, routes and privacy rules.

## Implemented surfaces

- Discover pairs the original headline with a server-rendered profile illustration.
  Real catalog covers are used. The example rating/tier is labeled as illustrative;
  it does not represent a person and never enters database records. Profiles still
  start empty and private. The hero has two actions: profile and catalog.
- The shared header is 64px at every width. Below 1280px, a native disclosure
  exposes every existing navigation destination and the display preferences.
  It supports keyboard activation and Escape, and closes
  when a route link is selected. Search and Log remain directly available.
- Catalog search stays visible; filters and sorting use an explicit expandable
  panel below 1024px, with a count of applied filters. Desktop displays the fields
  in a toolbar. URL filters, pagination and infinite loading are preserved.
- Catalog cards show at most two genres. Guest cards do not imply personal log
  status. Logged personal status, tiers, tags and edit actions remain available.
- Game details group score/tier with the actual log entry and move community
  score availability below it. The title and logging action lead the page.
- Compare keeps its real handle suggestions and access rules, improves field
  outlines, and explains the result before the first comparison. No sample
  handles or invented compatibility metrics are added.
- Empty community/friend discovery gives a profile visibility/setup action.
  Empty metric sections are omitted when other community content is available.
- New interface copy has Argentine Spanish translations. New controls use the
  existing color roles and visible focus; motion remains minimal and respects
  reduced motion.
- The three existing text fonts are self-hosted through Next.js. Icon space is
  reserved while the existing Material Symbols font loads.

## Validation

The follow-up homepage pass preserves registration intent with `/login?mode=register`
while ordinary login still selects sign-in. Signed-in visitors keep the profile route.
Mobile hero/preview spacing is tighter; the four covers link to their games and
titles wrap without clamping. The duplicated sample title/cover remain desktop-only.
Empty community discovery links guests to registration, unfinished accounts to
setup and profile owners to visibility settings. Homepage descriptions accurately
describe catalog selection. Desktop scrollbars are visible and touch page scrolling
uses browser defaults; contained scroll regions keep their existing behavior.

Use `pnpm typecheck`, `pnpm lint`, `pnpm test` and the Playwright guest,
comparison, friends, accessibility and ui-redesign journeys. The fixture runner
builds the production application with local test identities/data and isolated
provider credentials; it does not mutate production data.

Review both themes and locales at phone/tablet/desktop widths. The UI redesign
journeys save homepage, catalog and game detail screenshots in `e2e-artifacts`.
Core Web Vitals require field measurements after deployment; no performance
numbers are claimed from these functional checks.
