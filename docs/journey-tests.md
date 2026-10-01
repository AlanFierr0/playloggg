# Repeatable journey checks (step 3)

## Suite and isolation

Playwright 1.63.0 is a pinned development dependency. Guest tests cover catalog
pagination, combined filters, empty results, keyboard search selection, search
exit, theme/language cookies across navigation/reload, mobile navigation,
horizontal overflow, sample controls, guest Shelf sign-in navigation, catalog-link
copying and denied clipboard fallback.
A shared test fixture records unhandled browser exceptions and local application
HTTP 500 responses. The user approved a local fixture backend. Authenticated browser checks exercise
the actual server actions and Supabase SDK against that fake API: unscored Backlog,
zero hours, saved review, failed-save draft retention and score zero with an
independent Tier S. Guest private/unknown profile and nested pages return 404;
a published fixture entry and curated list remain readable.

`pnpm test` runs the existing domain/rendering checks. The main checks workflow
prepares route types, checks TypeScript and lint, and runs these tests without
production credentials. A separate browser job runs both desktop (1440 px) and mobile (375 px) projects
on every push to `main`. No production secrets are configured in either job.

## Post-deploy smoke

`pnpm test:smoke` performs anonymous, read-only checks against the fixed production
origin. It verifies Discover, catalog, search, sign-in and published-profile comparison page
markers, plus unknown-profile and nested-entry/list 404 responses. It never signs
in, writes, deletes or accepts an arbitrary deployment URL.
The deployment-status workflow reports a failed Vercel Production deployment or
runs the anonymous smoke checks after a successful one. It is also runnable
manually. Build logs remain available in Vercel; the CI browser job retains
build/server logs, an HTML report and screenshots/traces on failure for seven days.

After deployment, use one controlled test account for this short manual check:

1. Sign in and verify the displayed profile is the expected test identity.
2. Save an unscored Backlog entry for a designated test game, then reload it.
3. Check an independent tier, zero hours and a review persist as entered.
4. Confirm its private public URL and nested entry/list URLs return 404 as a guest.
5. If publishing is being changed, publish only the test profile, verify the public
   entry, unpublish and recheck guest 404 responses. Restore its intended state.
6. Sign out. Inspect Vercel's deployment/build status and recent errors for affected
   routes. Keep credentials and auth links out of logs, artifacts and this document.

Existing rollback-only SQL scripts in `supabase/tests` remain the database/RLS
checks. A mocked API cannot establish real Auth or Postgres policy correctness;
the unavailable second-Steam-account production check remains documented in
`production-acceptance.md`.

## Running and debugging locally

Install dependencies with `pnpm install --frozen-lockfile`, then install Chromium
with `pnpm exec playwright install chromium`. Run `pnpm test:e2e`; it starts the
fixture API on loopback port 3101, builds the real application into `.next-e2e`,
and starts it on loopback port 3100. Ports must be free; existing servers are never
reused. The server overrides Supabase, owner and site configuration and clears
IGDB credentials and replaces the admin key with a loopback-only fake value even when ignored local environment files exist. There
is no test sign-in route, production authentication bypass or schema change.
All fixture controls and writes live in the test-only in-memory server.

To reproduce one failure, use
`pnpm exec playwright test e2e/owner.spec.ts --project=desktop`. Inspect
`e2e-artifacts/server.log`, `playwright-report/`, or open a failed trace with
`pnpm exec playwright show-trace test-results/<failed-test>/trace.zip`.
Artifacts contain only fake fixture accounts/sessions; do not add real auth
cookies or credentials to this runner. Test source uses the existing app
controls and does not change navigation or display behavior to satisfy checks.

Local verification results and hosted workflow/deployment status are recorded
after the push. Local checks passed: all 16 browser checks (eight journeys at
both widths), all 41 domain/rendering tests, lint, TypeScript, the production
build and all eight anonymous production smoke routes. The fixture build and
production build use separate directories. Real Steam/email sign-in and actual database RLS
remain separate acceptance/SQL checks; this suite verifies application journeys
against the agreed fake backend, not a complete Supabase service.

Reference: [Playwright CI documentation](https://playwright.dev/docs/ci).

Step 7 adds catalog-only sitemap/metadata assertions and private save, publish,
guest-read and unpublish journeys at both widths, using a loopback-only fake admin
key. The current suite has 40 browser checks and 59 Node tests. The metadata
assertions passed after adjusting the homepage canonical expectation for Next.js
trailing-slash normalization; the other 38 browser checks passed in the full run.
