# Public email magic-link sign-in

The user requested email links for every user, replacing the removed owner-only
option. Login now offers Steam and three email options: password sign-in, account
creation, and Email link. The email-link form requires only a valid email address.

The existing public Supabase Auth client sends `signInWithOtp` with automatic
Auth registration allowed and a fixed `/auth/confirm` callback. No admin key or
owner email allowlist is involved. A link must verify through Supabase before the
session is accepted. Existing accounts open their profile; accounts without a
profile enter the existing name setup and create an empty private profile.
Email/password, verification and password recovery remain available.

Email is delivered through the project's existing Auth SMTP/template settings.
For cross-browser token-hash verification, the Magic Link email template should
use `/auth/confirm?token_hash={{ .TokenHash }}&type=email` at the configured site
URL. Default PKCE confirmation URLs also work when opened in the initiating
browser. This matches [Supabase passwordless email documentation](https://supabase.com/docs/guides/auth/auth-email-passwordless).

No database/schema or access-policy change is needed. Sending an email does not
create a profile, rating or ownership relationship; verified profile setup does.

## Verification — 2026-10-01

Production Auth settings confirm email sign-in enabled, registration enabled and
email verification required. No provider setting or schema changes were needed.
Unit coverage verifies any valid email can request a link without a password or
owner allowlist, ignores submitted redirect/ownership fields, and handles provider
failures without exposing internal messages.

TypeScript, lint, the production build and all 68 unit tests passed. Fourteen
browser checks passed across desktop/mobile: email-link requests, verified and
expired callbacks, ordinary search navigation and eight accessibility audits in
English/Spanish and light/dark mode. Callback tests use isolated Supabase doubles;
actual SMTP delivery to an inbox was not exercised in this run.

The search header no longer displays Command/Ctrl+K or intercepts that shortcut.
Clicking the search link and Enter/arrow/Tab/Escape behavior in search still work.
