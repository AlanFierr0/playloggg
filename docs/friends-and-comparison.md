# Friends and game comparisons

1. Open **Friends** in the main navigation.
2. Type a display name or handle (an initial `@` is optional). Results update after
   a 250 ms pause; Search/Enter still work, and clearing resets pagination.
3. Follow a profile to keep it in **Following** and see its eligible updates in
   **Activity feed**. Following requires discovery consent; Unfollow remains available.
4. Choose **Compare games** on a friend card or in Following. Your authenticated
   profile is always first; the friend is preselected as the second profile.

The user approved searching all public profiles, including those without discovery
consent. Private profiles stay hidden. The empty-query directory still lists only
discovery participants; following and community feeds retain their existing consent
requirements. Search cards offer comparison for any public match and hide Follow
when the target has not enabled discovery. Profiles default to public, and owners
may make them private.
Blocked connections in either direction are excluded from friend search.
Search is case-insensitive and pagination preserves the search term. Next.js Form
reuses the server-rendered query and anonymous reads; live updates replace history,
preserve focus/scroll and cancel pending timers on submit/unmount.

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
unfollow, private profile exclusion, public link-only search, rapid input/clear/reload, Argentine Spanish,
accessibility and horizontal overflow. It also checks that the owner's private
public page and comparison image export remain unavailable. Comparison tests
cover guest/public access and exclusion of other users' private profiles.
Fixtures test application behavior; they do not replace database RLS audits.

No schema or RLS migration is required: existing owner read access, follow/block
policies and public profile reads are reused.


## Compare presentation

Compare keeps the existing dark/gold palette, type, routes, handle fields and
privacy rules. The picker offers direct shortcuts to up to six followed public
profiles, using the same authorized friend list as its input suggestions.
The summary groups identities, Taste Match, shared count, score difference and
correlation; missing metrics say Not enough data. Compact cards place agreements
and disagreements together. Genre averages name each profile, and the chart and
genre analysis sit side by side on desktop. The formula lives in a keyboard
accessible disclosure. Public comparisons keep the existing share export after
the results, including when no games overlap. Calculations are unchanged.

Design direction: preserve, variance 4, motion 1, density 5. Keep controls familiar,
use spacing and smaller covers for scanning, and avoid decorative animation.
