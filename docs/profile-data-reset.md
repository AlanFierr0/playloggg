# User-authorized profile data reset — 2026-10-01

The user requested deletion of all profiles after removal of the obsolete sample
columns. Inspection found two profiles, one saved rating, no lists/favorites and
no profile-picture objects. `supabase/delete-all-profiles.sql` was executed manually
as one transaction; it is never invoked by application builds or automatic seeds.

All profile records and dependent portfolio entries were deleted. Verification
confirmed zero profiles, ratings, favorites, curated lists and list items. The
1,000-game catalog retains identical metadata and the two Auth accounts remain.
No picture files existed, so no Storage deletion was required.

Existing users can still sign in, then choose their names to create a new private
profile through the existing setup flow. Deleting Auth accounts was outside this
request. Schema, ownership policies and publication defaults were unchanged.
