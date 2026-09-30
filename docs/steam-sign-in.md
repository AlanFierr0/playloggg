# Steam sign-in

Deployed to production from `main`. Real Steam sign-in, private setup, save/reload,
sign-out and repeat sign-in passed on 2026-09-30. Isolation was checked against
the email-owner account; a second Steam account was unavailable. See
[production acceptance](production-acceptance.md).
The user approved public Steam registration, a server-side Supabase session
bridge, and private profiles with handle/display-name setup. Existing owner email
login remains available. No schema migration, new public grants or dependencies
are required; the inspected schema already isolates each profile's entries and
lists through `owner_user_id` and RLS.

## Flow

1. `/login` posts to `/auth/steam`. The server checks the configured origin and
   sets a random, ten-minute, HttpOnly, SameSite=Lax state cookie. HTTPS uses Secure.
2. Steam authenticates on its own website using OpenID 2.0. The callback checks
   state, duplicate parameters, exact return URL, endpoint, signed fields, identity
   and nonce age before asking the fixed HTTPS Steam endpoint to verify the assertion.
   Provider fetches have timeouts and do not follow redirects.
3. Only a verified Steam identity reaches the server-only Auth admin client. It
   creates or reuses a Supabase user with administrator-owned Steam metadata and
   a reserved `users.playlogg.invalid` internal address. Existing accounts without
   the matching administrator-owned Steam identity are rejected. Browser-supplied
   email, profile IDs and user-editable metadata never establish ownership.
4. An admin-generated one-time token is verified on the server to establish the
   normal Supabase cookie session. No email is sent and no token is returned in a
   URL or browser payload. This is an application bridge, not a native Supabase
   Steam OAuth provider. The Supabase session uses its OTP mechanism; it must not
   be treated as evidence of mailbox verification or additional authentication factors.
5. First sign-in opens `/signup`. The user chooses a unique lowercase handle
   (3–30 letters, numbers or underscores) and display name (1–80 characters).
   Profile creation fixes ownership to the verified session and always creates
   a private, non-sample profile. It cannot claim or overwrite another profile.
   Taken-handle errors preserve the draft. Repeat sign-ins reuse the profile.

Steam users can save their own ratings, tiers, statuses, reviews, tags and lists.
The original owner alone can search/import IGDB games, enforced on the server
and reflected in the UI through `canImportCatalog`. Steam login creates a separate
account; it does not automatically merge with the existing email owner's profile.
The shared public catalog and sample portfolio remain available to visitors.

## Configuration and activation

Use the existing server-only `SUPABASE_SECRET_KEY` and public Supabase URL/key.
Set `PLAYLOGG_SITE_URL` to the exact application origin, for example the production
Vercel origin or `http://localhost:3000` locally. Local tests on another port must
use that exact port. Steam sign-in does not require a Steam Web API key, client
secret, email SMTP configuration or a Supabase custom OAuth provider.

Keep normal public email signup disabled; Steam provisioning uses the trusted
admin API only after provider verification. Tokens, assertions, Steam IDs and
secret values must not be logged. Steam authenticates on its own site; Playlogg
never receives Steam passwords. The owner reported the existing secret key is
configured in Vercel Production, while the ignored local environment lacks it.

On production, sign in with Steam, choose names, save an unscored
Backlog entry and a list, reload, sign out and sign back in. Repeat with a second
Steam account to confirm isolation. Publishing and name changes are implemented
in [public profiles](public-profiles.md). Steam library syncing and linking Steam
to the owner's email account remain separate features.

## Verification

- Build, TypeScript, lint and all 31 automated tests pass. `scripts/test-steam-openid.mjs` covers state,
  identity, endpoint/return URL, unsigned fields, nonce expiry, duplicate parameters,
  direct provider verification, failed responses and profile input validation.
- Isolated browser/Auth/Data/provider fixtures verify first sign-in, private name
  setup, duplicate handles, subsequent sign-in reusing the profile, unscored Backlog
  saving/reload, and separate users' ratings and lists. IGDB controls are absent for
  ordinary Steam users. Fixtures use dummy credentials; no real Auth users,
  profiles or ratings were created by these checks.
- Login and name setup fit at 320, 390, 768 and 1440 pixels without horizontal
  overflow. The mobile setup screen was visually inspected.
- Live schema inspection confirms ownership uniqueness, private defaults,
  cross-owner RLS predicates and denied public profile/catalog inserts. The security
  advisor reports no database/RLS issues; its pre-existing password-protection
  warning remains unchanged.
- Production checks confirm the login button, secure state cookie, redirect to
  Steam with the production callback origin, rejection of invalid callbacks,
  guest setup redirect, Games filters and branded tab icon. No browser or recent
  Vercel runtime errors were found.
- The 2026-09-30 production acceptance established a real Supabase session through
  Steam, saved/reloaded the requested Backlog entry and a temporary list, and
  reopened the same profile on repeat sign-in. Steam search/import actions were
  denied on the server. No second Steam identity was available for that scenario.

References: [Steam browser authentication](https://partner.steamgames.com/doc/features/auth),
[Supabase admin users](https://supabase.com/docs/reference/javascript/auth-admin-createuser),
[one-time tokens](https://supabase.com/docs/reference/javascript/auth-admin-generatelink).
