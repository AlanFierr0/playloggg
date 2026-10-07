# Platform scores

The user approved averaging 0–100 scores across all profiles, including private profiles anonymously. The service-only SECURITY INVOKER function platform_game_scores aggregates in Postgres; no individual ratings, profile IDs, handles or reviews are returned. Public and authenticated roles cannot execute it or read additional private data. Existing RLS is unchanged.

Only scored entries contribute. Zero counts; null does not. One current rating exists per profile/game. A single score is enough. The average is the sum of scores divided by their count. Platform averages are independent of personal scores, tiers and preference order; existing discovery averages retain their consent rules.

Games reads fresh aggregates on the server, paginates beyond the API row limit, and offers Platform score: highest/lowest. Unavailable averages are last in both directions, with deterministic title/slug ties. Cards display the average to one decimal place with the rating count; sorting uses the full average. URL filters, pagination and reloads retain the chosen sort.
