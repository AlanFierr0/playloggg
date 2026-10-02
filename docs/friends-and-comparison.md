# Friends and game comparisons

1. Open **Friends** in the main navigation.
2. Search by display name or handle (an initial `@` is optional).
3. Follow a profile to keep it in **Following** and see its eligible updates in
   **Activity feed**. Unfollow and block controls remain available.
4. Choose **Compare games** on a friend card or in Following. Your authenticated
   profile is always first; the friend is preselected as the second profile.

Friends appear in search only after publishing their profile and separately
opting into discovery in Profile settings. Profiles remain private by default.
Blocked connections in either direction are excluded from friend search.
Search is case-insensitive and pagination preserves the search term.

## Owner-only private comparison

The user approved comparing their own private profile with a public friend.
The server verifies the session through Supabase Auth and resolves ownership
from `profiles.owner_user_id`. Only this verified profile uses the authenticated
client; the other profile must be readable through the anonymous public client.
Ownership/publication are checked again after the paginated entry reads.

This does not publish the owner profile. Anonymous comparisons, public profile
pages and comparison image exports continue to require public profiles. Share
card controls are absent when the comparison includes a private profile.
Private entries are never added to friend discovery or activity feeds.

Scores, tiers and favorites retain their independent meanings. Taste Match needs
at least five shared scored games and equals 100 minus the mean absolute score
difference. Shared games can still be compared below that threshold.

## Verification

`e2e/friends.spec.ts` covers desktop/mobile search, follow persistence, comparison,
unfollow, block/unblock, private/link-only discovery exclusion, Argentine Spanish,
accessibility and horizontal overflow. It also checks that the owner's private
public page and comparison image export remain unavailable. Comparison tests
cover guest/public access and exclusion of other users' private profiles.
Fixtures test application behavior; they do not replace database RLS audits.

No schema or RLS migration is required: existing owner read access, follow/block
policies and public profile reads are reused.
