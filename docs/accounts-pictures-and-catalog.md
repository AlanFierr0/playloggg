# Accounts, profile pictures and catalog expansion

The user approved 1,000 well-rated released catalog games, IGDB search/import
for any signed-in profile owner, and separate private profiles for verified
email/password registrations. Steam and the original owner's email link remain.
Accounts are not automatically linked. These changes are outside the cancelled
backup/recovery milestone.

## Sign in and register

1. Open `/login` and choose Steam, email sign-in or Create account.
2. Email registration requires a 12–128 character password. Verify the email
   using the inbox link, then choose a unique handle/display name at `/signup`.
3. New profiles start private and empty. Existing records are never transferred.
4. Forgot password sends a generic recovery response, then the verified callback
   opens `/reset-password`. The original owner may use a reset link to set an
   email password as well. Steam's synthetic email cannot be used for this flow.

Only Auth-verified server identity and confirmed email/server-owned Steam metadata
enable account access. Editable user metadata cannot grant access. Profile ownership
is resolved by `owner_user_id`; profile creation whitelists names and forces the
private default. Passwords go to Supabase Auth, never application tables or logs.
Production's public Auth settings were checked: email enabled, registration enabled,
email confirmation required. Browser fixtures verify forms and routing; delivery of
a real registration/recovery email still requires a user inbox check.

Existing Supabase URL configuration must allow the canonical `/auth/confirm`
callback. Default confirmation/recovery templates work with the supported PKCE
code exchange. Custom templates can use `/auth/confirm?token_hash={{ .TokenHash }}&type=signup`
or `type=recovery`. The owner magic link still uses `type=email`. Callbacks ignore
arbitrary destination URLs. No credentials belong in templates/documentation.

## Profile pictures

Open Settings → Profile picture. Choose JPEG, PNG or WebP up to 2 MB, upload,
or remove the current picture. The server checks actual image bytes, bounds
decoded pixel count, orients/crops to at most 512×512 and encodes WebP without
the original metadata. `sharp` is a direct dependency for this processing.
Next's 3 MB action-body allowance accommodates the 2 MB file plus multipart data.

`profiles.avatar_url` stores a server-generated `profile-id/random-uuid.webp`
storage path. No arbitrary external image URL or Auth user ID is exposed.
The private `profile-pictures` bucket accepts WebP up to 1 MB. Authenticated
uploads/reads/removal require the folder's profile to belong to `auth.uid()`.
Anonymous bucket reads remain denied, including for published profiles.

`/avatars/[id]` serves an image only after fresh owner/public RLS checks and
checks visibility again after downloading. All responses are private/no-store.
Unpublishing makes future anonymous requests return 404, even with an old URL;
already downloaded images cannot be recalled. Existing pictures fall back to
initials on error. Superseded files are removed through the Storage API; failed
cleanup may leave an inaccessible orphan for later maintenance.

Migrations: `20261001175944_private_profile_pictures.sql` and
`20261001181313_picture_profile_folders.sql`, applied to the existing project.
Rollback SQL in `supabase/tests/private_picture_access.sql` checks owner upload/read,
cross-account upload/read denial and anonymous denial even after publishing.
Fixture browser checks also cover upload, publication, unpublication and removal.

## Catalog

Production `pnpm build` first runs `scripts/bootstrap-catalog.mjs`. This is an
authorized initial expansion using Vercel Production's existing server secrets;
local and preview builds skip it. It checks the stored count, imports in bounded
100-game batches and stops at 1,000 total records. Later builds skip completed
expansion. A failed batch fails the new build; existing production stays available
and a retry resumes without replacing reviewed catalog records.

Candidates have released dates, cover art, provider total rating ≥75 and at
least 10 total ratings, ordered by rating count. Those selection metrics never
become user scores/community statistics. Only normalized public metadata/artwork
references are stored. The bootstrap changes no profiles, ratings, lists or favorites.
IGDB HTTP requests are sequential, throttled and retried for temporary failures.

Games → title search → Missing a game? lets signed-in users explicitly search IGDB
and import a selected edition. The search dialog, log and list editor reuse the
same access. Guests see a sign-in link. Server actions reverify the owned profile,
accept only a bounded query/numeric ID, refetch provider metadata and preserve
existing IGDB IDs with conflict-ignore inserts. Database roles still have read-only
catalog permissions. Importing a game does not create a personal log entry.

## Demo removal and verification

Guest layouts/catalog/detail pages have no demo profile fallback or invented
entries. Personal profile/ranking/tiers/lists require sign-in. Sample profiles
cannot appear on public portfolio/comparison routes. Original design exports and
test fixtures remain archival/test material, not runtime portfolio records.

Initial live inspection found one unowned sample profile, 32 sample ratings and
32 seeded real game records, with no real-user references to those games. The
database cleanup scope remains pending the user's requested choice; it has not
been executed. Prefer removing the fake profile/ratings and keeping real reviewed
game metadata with sample labels cleared.

Validation: 68 unit tests; typecheck/lint/production build; 44 existing browser
checks plus six new desktop/mobile account/picture/guest checks; live rollback
Storage policy checks with zero remaining fixture identities/objects. Publication
checks include an already-known picture URL after unpublishing. Production
catalog expansion and rollout are verified: commit `e40d1ce` reached READY on
Vercel, exactly 1,000 distinct IGDB IDs are stored, 18 smoke checks passed and
12 live browser checks across 1440/768/375 px found no overflow, broken images
or browser exceptions. Real profiles/ratings remained at 2/1. Sample profile
and 32 sample ratings remain in the database pending the cleanup choice.
