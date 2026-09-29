# Profile settings and shareable portfolios

Implemented on `main` locally; production rollout requires the user's approval.
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
lists visible. Production owner sign-in and public publishing have not yet been
tested. The fixture used dummy credentials and did not change production data.
