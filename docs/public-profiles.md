# Profile settings and shareable portfolios

Deployed to production from `main`. Signed-in publishing/unpublishing and handle
changes passed on 2026-09-30 using the real Steam-owned profile and a separate
anonymous browser. Populated entry/list pages followed visibility; the original
handle and private visibility were restored. See [production acceptance](production-acceptance.md).
Each non-sample owner can open `/settings` to edit their handle/display name or
publish/unpublish their profile. Profiles remain private by default. Existing
owner email sign-in and public Steam registration use the same verified
`getAccount` ownership check. Changing a handle changes its public URL; old
links stop working. Handles must remain globally unique.

Publishing exposes `/u/{handle}` rankings, tier board, curated lists and saved
game entries. Scores, tiers, playback details, reviews and tags are visible
there. Account email, Steam ID and Auth details are never returned by the public
queries. The publish control describes these consequences before it is used;
the public link and copy control appear only when published. Unpublishing
returns all public profile, list and entry pages to 404. Unknown and private
handles use the same generic unavailable page and no profile metadata.

The public portfolio uses a dedicated anonymous Supabase client with no session
cookies and uncached reads. Existing profile, ratings and curated-list RLS
policies enforce visibility at the database. The route rechecks publication
after reading pages. Owner settings are Server Actions: they verify Auth,
require a non-sample profile, whitelist fields and constrain the privileged
update by both Auth user ID and profile ID. No schema migration, public profile
write grant, new dependency or credentials are needed. IGDB import remains
restricted to the original owner.

Verification: `pnpm typecheck`, `pnpm lint`, `pnpm build` and 34 Node tests pass.
The new tests cover forged IDs/fields, Auth ownership, duplicate handles,
private and unknown handles, pagination beyond 500 ratings, and independent
settings updates. In an isolated browser/Auth/Data fixture, owner publishing
opened the public rankings, tiers, lists and entry pages to an anonymous
visitor; unpublishing returned the profile and list to 404. Public pages showed
no edit controls. A 390px viewport had no horizontal overflow and was visually
inspected. A live SQL check under `anon` showed no private profiles, ratings or
lists visible. The production deployment is READY: the published sample profile,
tiers and lists return 200; a private handle and an unknown handle return 404;
guest settings redirect to login. The browser rendered the public rankings with
working navigation and no error overlay, and Vercel reported no recent runtime
errors. These initial fixture checks used dummy credentials and did not change
production data. The later real production checks are recorded in the acceptance
report linked above.
