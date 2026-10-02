# Account deletion

Delete account replaces the former profile-only operation. The owner Danger zone
requires the exact handle; an authenticated account without a profile can delete
itself from the signup Danger zone by typing DELETE. All ownership is resolved by
fresh Auth verification. No browser-supplied Auth IDs or file paths are trusted.

The trusted server enumerates files owned by that Auth user, including older
uploads without a remaining profile. It also includes files in the current owned
profile folder. Storage API removal must succeed before deleting the profile.
The existing transactional RPC removes personal entries and their dependent data.
A second service-only RPC clears private operation counters after checking that
no profile remains. Global sign-out revokes refresh sessions, then Auth Admin
hard-deletes the user. Browser session chunks and the verifier are explicitly
expired even when local logout fails. Successful deletion returns to login with
Create account selected. Signing in with Steam again creates a fresh Auth user.
The shared catalog and other accounts remain intact.

Storage, database and Auth API calls cannot form one transaction. A failure after
profile deletion keeps the Auth account until retry; the dialog explicitly reports
incomplete deletion and switches confirmation to DELETE. Reloading or signing in
again reaches the same account-only control. Storage failure prevents further
stages; a later profile failure may leave the old picture removed. This control
does not promise erasure of provider-managed backups or service logs.

Migration: 20261002201316_complete_account_deletion.sql. Both RPCs use SECURITY
INVOKER and are callable only by service_role. The operation counter table remains
unavailable to browser roles. SQL rollback checks cover file isolation, private
counter cleanup and execution grants. Browser fixtures cover confirmation,
cancellation, stage failures/retry, removed credentials, revoked stale sessions,
profileless accounts and preservation of other files, profiles and games.
