# Tiempo de Videojuegos reference profile

Public URL: https://playloggg.vercel.app/u/tiempo_de_videojuegos

This is an independently maintained reference, not an official account.
There is no Auth account; owner_user_id stays null.
Existing ownership checks and RLS prevent application users from editing it.
Database administrators maintain the ratings. The profile is public; discovery opt-in remains off.

Source: https://www.youtube.com/@TiempodeVideojuegos
Approved archive: https://emiliorankings.com/

Snapshot: 2026-10-07. Imported 206 entries from 373 archive entries.
Numeric ranges use the rounded midpoint: 80–81 becomes 81.
The profile description is in Spanish. Reviews contain only timestamped YouTube links.
At the user’s request, all scored games are assumed Completed, and scores of 95–100 become favorites.
Tiers derive from scores: S 95–100, A 90–94, B 80–89, C 70–79, D 50–69, F 0–49.
These completion statuses, favorites and tiers are site curation, not claims made by the channel.
No hours, completion dates or featured Top 4 slots are inferred.

Only unambiguous title-and-release-year matches with numeric scores and source videos are imported.
Qualified scores (inequalities/approximations), archive annotations needing authorship review,
and missing/ambiguous matches are in the review queue.
Check those entries before adding scores. Unscored catalog games remain unrated.

Run supabase/reference-profiles/tiempo-de-videojuegos.sql as a database administrator.
It creates the unowned profile if absent, verifies ownership, and inserts ratings without overwriting existing scores/reviews.
It then applies the approved derived tiers and adds qualifying favorites.
This is a data seed, not a schema migration.
The companion review JSON contains factual titles and exclusion reasons.
