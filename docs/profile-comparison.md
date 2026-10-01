# Real profile comparison (step 6)

Compare at `/compare` accepts two published profile handles. Handles are entered
explicitly; there is no profile directory, autocomplete or private-profile search.
The GET form stores `left`, `right` and table `page` in the URL for reload/sharing.
Private, invalid and unknown handles produce the same unavailable message;
selecting the same profile asks for two different profiles.

## Agreed calculation

Shared games are entries logged by both profiles, matched by game slug. A shared
game stays in the table when either score is null. Zero is a real score.
Only games scored by both profiles contribute to affinity:

`affinity = 100 - mean(abs(left score - right score))`

Display rounds to one decimal and requires at least five shared scored games.
Below that threshold the screen shows an em dash and an explanation, including
when there are no shared games. This is score similarity, not a statistical
confidence estimate. Tiers remain independent, with missing tiers shown as
unassigned; tiers and playback status never affect the formula.

Key Divergences displays up to two largest nonzero absolute score differences,
with slug as the tie-breaker. Unanimous Masterpieces keeps the existing section
for up to three shared games both scored at least 90, independently of tiers.
The shared table sorts by slug and uses 20-row server pages, clamping oversized
page numbers. Each entry links to the game and both public saved entries.
Names, scores, counts and cover images come from actual saved data. Published
sample profiles retain their sample label. Fixed personas, locations, log counts,
affinity percentages, invented reviews and consensus counts have been removed.

## Reads and privacy

`getPublicComparison` always uses the existing anonymous, uncached Supabase
client, even for signed-in owners. Both profile reads require `is_public = true`.
Ratings read only game ID, score, tier and status, scoped to each selected profile
in stable game-ID order and 500-row pages. Reviews and lists are not fetched.
Both profiles are rechecked after all paginated reads and shared catalog loading,
so unpublishing during the read returns unavailable rather than partial results.
The shared compact catalog remains cached independently of profile data.

No database writes, migrations, grants, auth changes, dependencies or new
credentials are needed. As with existing portfolios, offset pagination is not a
transaction snapshot, and already delivered public content cannot be recalled.

## Verification

Unit checks cover the formula, zero/null scores, five-game threshold, empty
intersection, independent/missing tiers, deterministic ties, input immutability,
1,001-entry reads, anonymous scoping, later-page failures and publication changes.
Local fixture journeys cover real form submission, reload, small/empty overlap,
private/unknown handles even while signed in, and mobile overflow. Accessibility
checks include the populated comparison in both languages and themes.
