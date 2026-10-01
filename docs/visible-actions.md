# Visible actions and sample claims

Step 2 of the application roadmap, 2026-09-30.

## Agreed behavior

The user approved Shelf opening the existing log editor, with guests signing in
first. Share copies the catalog game URL, never a private portfolio URL, and never
publishes a profile. API, Terms and Privacy remain hidden until actual destinations
and approved policy text exist. No legal policy was invented.

## Inventory and resulting behavior

| Area | Previous claim or control | Result |
| --- | --- | --- |
| Discover | Static spotlight, scores and quotes | Prominent sample editorial notice; existing art and cards retained. |
| Discover/game details | Shelf and Share prototype notices | Shelf navigates to the selected game's editor for an editable account, or sign-in for a guest. Share copies `/game/[slug]` with success feedback and a selectable link if clipboard access fails. Shelf does not save or change status until the editor is committed. |
| Original game details | Fixed “Your Personal Standpoint”, rank #1, score 98, 78.4 hours and review | Entry card renders the selected profile's saved score, independent tier, status, optional hours/date and review. Null scores and zero hours remain distinct. Unlogged and sample entries are explicitly identified. |
| Original game details | Fixed Tier S badge | Selected profile's actual tier or unassigned state. |
| Original game details | Median, rank/year, logs, score trend, following/curator quotes, distribution, list placements | Sample statistics and editorial sections labeled. Curator identities and quotes are illustrative, not authenticated activity. |
| Original game details | Add to Tier List navigated without adding | Renamed View tier board. Curated lists link goes to real lists without claiming 84 lists. |
| Original game details | Review sort/reactions/replies and illustrative list buttons | Disabled controls with visible Unavailable labels. |
| Imported game details | Real IGDB metadata and selected profile entry | Preserved, with catalog-link copying added. Public profile URLs share only the catalog URL. |
| Compare | Fixed named profiles, scores, affinity and shared-game metrics | Replaced in step 6 with [real published-profile comparisons](profile-comparison.md), independently displayed tiers and documented score affinity. |
| Tier board | Share Matrix / Organize Tiers notices | Disabled and visibly unavailable. Existing tier anchors and real game links retained. Edit independent tiers through the existing log editor. |
| Editor | Checked broadcast toggle with temporary state | Replaced by visible broadcasting-unavailable text. Saves remain limited to the approved entry fields. |
| Footer | API / Terms / Privacy notices; copyright 2025 | Placeholder controls hidden; current server year displayed. Archive navigation retained. |
| Language | New notices and action labels | English and Argentine Spanish dictionary coverage. Game titles and user-written reviews remain unchanged. |

Remaining sample screens are deliberately retained; this milestone does not add
community reactions, follows, broadcasts, comparison calculations or legal text.
Guest Shelf goes to sign-in; after signing in, select the game again to open its
editor. This does not change the existing authentication redirect behavior.

## Verification

Rendering tests cover the real owner identity, unscored Backlog, null tiers, zero
hours, score zero with independent Tier S, escaped user review, unlogged/sample
states and guest/editor Shelf destinations. Browser checks exercise catalog-link
copying and denied clipboard fallback, sample notices, disabled controls, footer
links, guest sign-in navigation and responsive layouts in both display preferences.
Build, typecheck, lint and the existing domain tests are required before rollout.
No schema, authentication or environment configuration changes are required.

Observed checks passed locally: production build (49 pages), typecheck, lint,
37 existing tests and four new rendering tests. Browser checks passed at 375,
768 and 1440 px with no horizontal document overflow on Discover, Compare,
imported game details, tiers and the editor. Original game details were also
checked on mobile in dark/English and light/Spanish. Clipboard success and denied
clipboard fallback both returned the catalog URL. Guest Shelf reached `/login`;
footer contains Archive and copyright 2026, with the three placeholders absent.
No browser errors were reported. Signed-in entry rendering and editor navigation
were checked with controlled component fixtures; this milestone did not create
or change any real account data.
