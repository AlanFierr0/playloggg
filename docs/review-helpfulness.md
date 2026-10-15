# Review helpfulness

Public reviews have Helpful and Not helpful buttons on profile reviews, public game entries and home review excerpts. Signed-in profile owners can cast one vote per review, switch direction or click the selected button to remove it. Authors cannot vote on their own reviews. Guests see counts and a sign-in link.

`review_votes` uses the existing rating identity (profile/game). Votes stay attached when a review is edited; blank or private reviews cannot receive new votes and expose no counts. Deleting the rating or voter profile cascades its votes. Database constraints enforce one vote and values of +1/-1; RLS limits reads/mutations to the verified voter's profile. Neither Auth IDs nor individual voter profiles are exposed publicly. A private, fixed-search-path aggregate function rechecks public review visibility; its public invoker wrapper exposes only totals and the caller's own vote.

Actions authenticate through `getAccount`, resolve the catalog game server-side, and rely on RLS for the target review. Counts update after confirmed persistence; failed saves preserve the last counts and offer retry. Reads remain request-local and paginated. Vote data loads only where reviews are shown, with streamed summaries on game pages.

Verification: `supabase/tests/review_helpfulness.sql` runs real allow/deny and aggregate checks inside a rolled-back transaction. `e2e/review-voting.spec.ts` covers switching, removal, reload persistence, failed-save recovery and guest controls on desktop/mobile.

Home replaces recent review excerpts with a swipeable Best reviews carousel (up to 12 reviews), ordered by upvotes minus downvotes, newest update, then profile/game IDs. It considers all nonblank reviews from discoverable public profiles, rechecks discovery consent, and uses the existing aggregate vote reader without exposing voters. Review cards link to the game, author and full review and retain voting controls. Native horizontal scroll, snap, keyboard focus and previous/next controls support desktop/mobile; reduced-motion preferences disable smooth scrolling. Ranking refreshes on page load.
