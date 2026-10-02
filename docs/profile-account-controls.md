# Profile account controls

The owner overview offers Sign out and Delete profile in a Danger zone at the
bottom, after all portfolio content. Header tools contain only portfolio actions.
Public profile pages never
show these controls. Sign out uses the existing Supabase action, clears the browser
session and returns to login without deleting saved data.

Delete profile opens a modal explaining the permanent removal of profile data.
The exact current handle is required in the UI and rechecked on the server against
the Auth-verified owner's profile. Cancel/Escape work before submission. Controls
are disabled while deleting; errors preserve the confirmation for retry.

The server-only `delete_owned_profile` RPC runs atomically as SECURITY INVOKER,
with execution restricted to service_role. It locks the row matching the verified
Auth owner and current handle, deletes ratings and lists (their foreign keys use
RESTRICT), then deletes the profile. Existing cascades remove favorites, rankings,
list items, likes, follows, blocks and activity. Catalog games and Auth accounts
remain. The server removes the returned current avatar through Storage after the
transaction; a failed file cleanup cannot roll back the completed database deletion.
Avatar requests recheck visibility, so a deleted profile's picture is inaccessible
immediately even if storage cleanup fails. No browser role receives new privileges.

After deletion the existing signed-in account returns to profile setup. This is
profile deletion, not Auth-account deletion or account merging. No scheduled
backups or historical storage purge are promised by this control.

Migration: `supabase/migrations/20261002153000_delete_owned_profile.sql`.
Generated function signature is reflected in `src/types/database.ts`.
`supabase/verify-profile-deletion.sql` verifies own-profile deletion, wrong-owner
rejection, child cleanup, other-profile/catalog preservation, Auth preservation
and grants entirely within a rolled-back transaction.
`e2e/profile-account.spec.ts` checks session clearing, confirmation, cancellation,
failed-delete retry, setup redirect and public-profile exclusion in both viewports.
