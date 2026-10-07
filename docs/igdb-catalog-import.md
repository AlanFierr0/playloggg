# IGDB search and catalog import

Status: deployed from `main` in commit `36e9226`. The owner confirmed the three
provider/server variables are configured in Vercel Production. Real authenticated
search/import and duplicate reuse passed on 2026-09-30; see
[production acceptance](production-acceptance.md). Local `.env.local` still lacks
these three variables. No schema migration or public catalog-write grant is
needed; the inspected live schema already has a unique `games.igdb_id`.

Current access (2026-10-01): all Auth-verified users with their own private or
public profile can search and import missing games. Original owner-only acceptance
below is historical. See [accounts, pictures and catalog](accounts-pictures-and-catalog.md).

## Behavior

Game search combines saved games and provider matches in one list, without source
labels or separate tabs. Signed-in users with a profile automatically search for
additional games after entering 2-100 characters and pausing for 400 ms. Query
changes hide old results; successful queries are cached for the search session.
Stored games appear once, identified by their provider ID. Missing games have an
**Import** button; search failures show a retry control without hiding saved games.

Import opens the game page or the selected log editor, depending on the current
flow. In the list editor it adds the game to the current draft; save that list
separately. Import creates no rating, playback status or saved list membership.
Guests search saved games and sign in to search/import additional games.

Existing IGDB IDs reuse the same catalog row. Concurrent imports use the unique
index with ON CONFLICT DO NOTHING, preserving metadata, slugs,
ratings and list references. New slugs include the source ID, avoiding collisions
between editions. Cached catalog pages expire immediately after import. Catalog
reads page through the API instead of silently stopping at 1,000 games.

Imported detail pages show actual metadata and the selected profile's log entry.
They do not display the prototype's illustrative community statistics or reviews.
Unavailable cover art uses a labeled text placeholder; no art is generated.

## Access and secrets

Every search/import Server Action validates input, verifies the current Auth user,
resolves its non-sample owned profile, and derives ownership from the verified
Auth user. Browser requests contain only the query or numeric IGDB ID.
Import fetches metadata again from IGDB and stores whitelisted public fields.
The browser cannot supply a slug, source URL, cover URL, profile or rating.

Only after authorization does the import action construct a separate server-only
Supabase client using a secret key. It has no session persistence or cookies.
Anonymous/authenticated catalog access stays read-only; there are no new grants,
policies or SECURITY DEFINER functions. The secret key has privileged access;
keep it exclusively in server configuration. This first milestone supports only
the existing allowlisted owner; enabling more owners requires a separate decision.

Provider requests use fixed HTTPS endpoints, bounded timeouts, cached OAuth tokens,
a bounded sequential queue and at least 300ms between requests per server process.
A 401 refreshes authentication once; 429 honors a bounded cooldown and shows a
retry message. Queue/cooldown state is per process, not a distributed quota;
IGDB's own rate limit remains authoritative across serverless instances. No
credentials, tokens, provider error bodies or raw game payloads are logged or
returned to the browser.

## Activate

1. Create a confidential application in the
   [Twitch Developer Console](https://dev.twitch.tv/console/apps).
   IGDB's [getting-started guide](https://api-docs.igdb.com/#getting-started)
   explains account requirements and obtaining a Client ID and Client Secret.
   Use a unique app name (for example Playlogg Catalog), enable Twitch 2FA,
   select Confidential, and use `http://localhost:3000` as the required redirect
   URL. IGDB client-credentials authentication does not use that redirect.
2. In the Supabase project's **Settings → API Keys**, create a separate secret key
   for the catalog backend. Prefer the current `sb_secret_…` key described in
   [Supabase API keys](https://supabase.com/docs/guides/api/api-keys).
3. Set these variables in ignored `.env.local` for local testing and in Vercel
   **Project → Settings → Environment Variables** for Production:

   ```text
   IGDB_CLIENT_ID
   IGDB_CLIENT_SECRET
   SUPABASE_SECRET_KEY
   ```

   Enter the actual values only in those secure configuration locations. Do not
   paste them into chat, source, this document or screenshots. None of these
   names should have `NEXT_PUBLIC_`. Use sensitive/secret configuration for
   secrets. `.env.example` contains empty placeholders only.
4. Restart the local server after changing its environment. Production needs a
   new deployment after its variables are configured; pushing the milestone
   to `main` triggers that deployment under the standing deployment authorization.
5. Sign in, search a title absent from the saved catalog, check the edition,
   import it, save an unscored Backlog entry, then refresh. Re-import should
   reuse the game. Create a list with another imported game and refresh it.

## Verification

Typecheck, lint, production build against the live read-only catalog, and 24
input/data/provider tests pass. Provider tests cover input escaping, malformed
IDs/records, metadata whitelisting, missing covers/releases, edition identity,
serialized requests, token reuse/refresh, cooldown and recovery after failures.

`supabase/tests/catalog_import_access.sql` passed against the live schema using
rolled-back temporary games: anonymous/authenticated direct inserts are denied;
duplicate server inserts preserve the original game and leave ratings and list
membership untouched. No permanent game or owner entry was created by that test.
The security advisor found no database/RLS issues. Its existing
[leaked-password protection warning](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
remains; Auth configuration was not changed.

An isolated local Auth/Data API and provider fixture verified owner search,
import/navigation, cached catalog refresh, duplicate reuse, unscored Backlog
saving, and import/add/save/reload with a preserved list draft. Live provider
authentication and production imports were initially pending. The 2026-09-30
owner acceptance imported Clair Obscur: Expedition 33 and confirmed duplicate
reuse plus server denial for the Steam account. Fixtures use dummy credentials; ignored real environment
files remain unchanged.

Additional browser checks passed provider-failure/no-result messages, Enter to
search, hiding stale matches after input edits, direct anonymous action denial
and forged-payload rejection without provider calls or inserts. Twenty route/
viewport scenarios passed at 320, 390, 768, 1440 and 1920px. A 1,038-game fixture
verified a game beyond the first 1,000 rows stays reachable after import/cache
invalidation. The production client bundles contain no admin-client or secret
configuration markers.

## Catalog expansion (2026-10-07)

The user approved expanding the existing catalog to 3,000 total games, in batches of up to 500. The production bootstrap now selects released main games with covers, excludes alternate editions using version_parent, and orders by total rating count with at least ten ratings. The previous 75-point minimum is removed so recognizable games with mixed reviews can qualify. Rating count is a visibility proxy, not a guarantee of popularity. Existing metadata and all personal entries are preserved. Missing niche titles still use the authenticated search/import flow. Local and preview builds continue to skip catalog writes.
