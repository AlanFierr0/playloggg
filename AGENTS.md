# Playlogg

## Current application
Playlogg is a persisted personal gaming portfolio backed by Supabase and deployed
from GitHub main to Vercel. Profiles, games and ratings are shared concepts for
all people. Prototype fixtures are only for tests and clearly labeled examples.
README.md is the current feature/route inventory. Older docs record historical
implementation decisions; they do not override this file or later user requests.

## Stack and development
- Next.js App Router, React, strict TypeScript, Tailwind CSS 3; use pnpm.
- Routes: src/app. Shared UI: src/components. Domain helpers: src/lib.
- Generated database types: src/types/database.ts. Versioned SQL: supabase/migrations.
- Original Stitch exports in design-reference remain untouched reference data.
- Work on main; do not create branches or PRs unless requested.
- Preserve existing visual design unless the user authorizes a redesign/change.
- Reuse existing helpers. Avoid unrelated refactoring and new dependencies.
- Keep logical commits and verify affected callers, fixtures, tests and configuration.
- Ask about consequential product ambiguity; proceed with routine authorized fixes.
- Push completed verified changes and deploy production without asking again.
- Ask before destructive Git actions, infrastructure resets or deleting production data.

## Ownership and privacy
- Verify Auth on the server and resolve ownership from profiles.owner_user_id.
- Never authorize from user_metadata, browser IDs, submitted emails or claimed handles.
- Users edit only their own entries. Keep existing RLS and ownership constraints.
- Public, discoverable profiles are the default. Users may change this in settings;
  private profiles cannot be discoverable. Preserve the private test account.
- Text search can find every public profile, independently of discovery opt-out.
  Blank directory browsing, follows and recommendations respect discovery consent.
- Private and unknown profile routes return the same 404. Recheck publication after reads.
- Managed reference profiles have no login and must disclose independent maintenance.
- Steam can link to a verified email profile; block linking to another profile's Steam ID.
  Never merge profiles automatically. Preserve Steam and verified email/password/link login.
- Normalize JPEG/PNG/WebP pictures to WebP in private Storage. Recheck visibility when
  serving pictures and do not expose Auth IDs in public picture URLs.
- Delete account requires exact handle (or DELETE for a profileless account), verified
  ownership, owned data/Storage cleanup, Auth deletion, session revocation and cookie cleanup.
  Keep shared games and report partial failure accurately so deletion can be retried.
- Keep secrets in ignored environment files. Never commit or document credentials.

## Ratings, rankings and tiers
- One current rating/review per profile/game. A score is optional; zero is a real score.
- Community/platform averages include all non-null scores anonymously, without a minimum.
  Never expose individual private scores. Controversy requires five scores.
- Whole-entry saves compare the original timestamp atomically. Conflicts keep the draft.
- Rankings follow score descending then slug; a moved game keeps its manual position
  without changing its score. Other games continue following scores. Preserve existing
  manually saved orders. Pairwise choices move the winner; skip does nothing. Autosave.
- Favorites are independent and unlimited, with optional ordered featured Top 4.
- Tiers use editable S 95–100, A 90–94, B 80–89, C 70–79, D 50–69, F 0–49 defaults.
  Manual assignments remain exceptions; moving to the matching score tier restores automation.
- Tier moves persist tier only, optimistically through a queue. Never upsert a whole entry
  or create an unlogged game from a board move. Public tier boards are read-only.
- Playback: completed, in progress, backlog, shelved, currently playing, paused, stopped playing.
- Hours may be blank or nonnegative decimal values, bounded by elapsed time since known launch.
  Completion dates may be blank, cannot precede known launch or exceed the current UTC day.
- Completion excludes active/paused/stopped entries and shows an ongoing-games summary.
- Played platforms include Nintendo consoles, Sega, mobile and browser options.
- Use shared played-platform labels; keep legacy pc for PC / Steam imports and sync.
- Votes allow one up/down vote per other user's current public review and no self-voting.
  Review text changes clear votes; score/status/tier edits retain them.
- Taste Match is 100 minus mean absolute difference across at least five shared scores.
  Genre/studio preferences need three scores; stats initially hide groups with fewer than five.
- Recommendations use 85%+ matches across five shared scores and source scores of 90+.

## Navigation, loading and retired features
- Main navigation: Games, Tier List, Profiles, Compare. Own tiers are at /tiers;
  published profiles also have a read-only tier tab.
- Profile tabs: Overview, Ranking, Reviews, Stats. Public profiles also include Tier List.
  Viewing-profile identity is below tabs and absent on Overview.
- Games use database filters and 25-card batches with accessible Load more and URL state.
  Search returns 24-card batches; no Actions category, keyboard hints or footer hints.
  Log search hides already scored games, including zero; unscored logs remain eligible.
- Personal/public portfolios load only logged and favorite games. Favorite catalog browsing
  loads separately. Never serialize the entire catalog to a profile.
- Personal ranking moves update immediately and serialize/coalesce saves. Failed drafts
  persist per profile in the same tab and require explicit retry/discard after conflicts.
- Home exploration stays stable until ten minutes or login-token expiry, whichever is first.
  Community sections use bounded database results and fail independently of core home.
  Review carousel sorts upvotes minus downvotes; personalized exploration uses the same seed.
- Steam imports offer rate all/some/none. Some supports genre, playtime and title filters.
  Import all selected games while rating new entries in descending playtime order.
  Preserve existing logs and concurrent manual edits. Import runs while the page stays open;
  unfinished import queues and rating sessions persist per profile in this browser.
  Leaving pauses the queue; Resume import retries safely. Preview loaded batches immediately.
- Lists, quick rate, yearly wrapped and activity-feed pages are retired and return 404.
  Keep stored list/activity/block records and their database constraints. Do not restore
  list, block/unblock or feed controls. Trending still uses trusted score-change activity.
- Shared profile/compare image APIs recheck visibility; wrapped/list exports stay unavailable.
- Keep responsive site-container alignment, accessible controls and reduced-motion support.
- Theme/language preferences use cookies: English and Spanish (Argentina), dark/light.
  Keep titles, names and original reviews untranslated. Review translation is deferred in TODO.md.
- Catalog pages are indexable; personal/public profile, auth, search and compare routes are
  noindex. Sitemap is catalog-only. Export/backup/recovery remain planned, not implemented.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes â€” APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` â€” verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
