# Production acceptance: roadmap step 1

Started 2026-09-30 against `main` commit `2c0a90a` and production deployment
`dpl_GujsN7Efbb1afNeJTC1ZFWijYRPK` at `https://playloggg.vercel.app`.
Status: all available-account production checks pass. The two-Steam-account
scenario remains untested because the user has only one Steam account available.
This report records observed production behavior, not fixture-test results.

## Verified

| Check | Observed result |
| --- | --- |
| Vercel deployment | READY; production alias points to the reviewed commit. |
| Supabase project | ACTIVE_HEALTHY. RLS is enabled on profiles, games, ratings, curated lists and list items. |
| Guest account routes | `/settings` and `/signup` redirect to `/login` (307). |
| Published sample pages | `/u/alexvance`, its tier board and lists return 200. The rendered rankings have no entry-edit or settings links and no browser errors. |
| Private and unknown profiles | The private owner's profile, tiers and lists return 404, as does an unknown handle. |
| Invalid Steam callback | An incomplete assertion redirects to `/login?error=steam` (307); no session is established. |
| Steam launch | A same-origin POST returns 303 to Steam, with the production origin as callback. The state cookie is Secure, HttpOnly and SameSite=Lax. |
| Steam launch origin check | A request without the expected Origin is rejected rather than redirected to Steam. |
| Recent application errors | Vercel reported no runtime errors for `/auth/steam/callback`, `/settings`, `/search`, and `/log` in the selected 30-minute window. The initial unfiltered query timed out and was narrowed. |
| Real Steam sign-in and setup | The user authenticated directly with Steam and created a separate empty, private profile. Supabase confirms administrator-owned Steam identity metadata on the new account. The existing email-owner profile remains separate. |
| Steam catalog access | Catalog browse/edit-entry controls are available, while the owner-only IGDB import link is absent. |
| Real publishing | Publishing the empty Steam profile made its public rankings readable to a separate anonymous browser, without edit links. Unpublishing restored profile, tier, list and nested entry/list routes to 404. |
| Owner email sign-in and IGDB | The user authenticated in a separate browser with the existing owner email link. IGDB search returned main-game, Deluxe Edition and update candidates. The main game, Clair Obscur: Expedition 33 (2025), was selected after inspecting its cover and platform metadata. |
| Real import and duplicate reuse | IGDB ID 305152 imported as `clair-obscur-expedition-33-igdb-305152`. Re-import reopened the same game; the database still contains exactly one row for that source ID. The catalog grew from 32 to 33 games. |
| Steam server authorization | Direct production search/import Server Action requests from the signed-in Steam browser returned owner-access denial messages. The restriction is enforced beyond hiding UI controls. |
| Entry save and reload | The Steam account saved the user's requested Expedition 33 as Backlog. Reload retained the status with null score, tier, platform, playtime, completion date and review, and no tags. |
| List save and reload | A temporary list containing Expedition 33 survived route navigation, reload and repeat sign-in. |
| Account isolation | The email-owner account could not open the Steam account's private list and did not inherit its entry. The owner remains at zero entries/lists. This exercises two accounts with different login methods, not two Steam identities. |
| Populated public pages | While published, the saved entry and list were readable in an anonymous browser without edit controls. After unpublishing, the profile, tiers, list and saved-entry pages returned 404. |
| Handle changes | A temporary handle changed the public URL: the old URL returned 404 and the new profile/list URLs returned 200. The original handle was then restored. |
| Sign-out and repeat Steam sign-in | Sign-out returned the account screen to the guest state. Repeat Steam authentication reopened the existing profile and saved list. The database still has exactly one Steam account. |
| Final state and cleanup | Both non-sample profiles are private. The original Steam handle is restored. The test list was removed through its owner's UI. The user-selected Backlog entry and shared imported game remain. |

Before the interactive test, the database contained zero Steam-created accounts,
one private non-sample profile and 32 catalog games. These are aggregate counts;
no credentials, tokens, assertions or account identifiers are recorded here.

## Remaining limitation

The user confirmed that no second Steam account is available. A separate future
check should verify isolation between two Steam identities. Do not describe that
scenario as passed; the current isolation evidence uses the Steam and email-owner
accounts. No application/schema changes or synthetic Auth users were needed.

The user completed real Steam and owner-email authentication directly. No
admin-created session or mocked callback substituted for provider sign-in.
Recent runtime-error checks covered `/auth/steam/callback`, `/settings`, `/search`,
`/log`, `/lists` and `/lists/[id]` with no errors in the selected 30-minute window.
Browser checks also reported no application runtime errors. The final privacy
recheck caught navigation before an asynchronous visibility update completed;
the check was repeated while waiting for its success message, then all public
URLs and the database private flag were verified. No false pass was retained.
