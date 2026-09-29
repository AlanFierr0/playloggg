# Owner sign-in and saved ratings

Status: deployed from `main`; database migration applied, confirmed owner account
linked to a private profile, and the user confirmed production magic-link sign-in
works. A first real production rating save is still to be verified; the last
inspection found zero ratings on `sakapatate`.
The user approved owner-only access, email magic links, and handle `sakapatate`
with display name `Sakapatate`. The actual email is private server configuration.
The personal profile starts empty and private, separate from Alex Vance's samples.

## Access model

`profiles.owner_user_id` is a unique nullable reference to `auth.users`. Only
administrators create profiles and assign ownership. A sample cannot have an
owner. Application roles cannot claim, edit, or publish profiles, edit the
catalog, or delete ratings. Owners can read their private profile and insert or
update its ratings. Both old-row and new-row RLS checks enforce ownership.
Anonymous access retains public reads only, excluding ownership identifiers.

The server checks the configured owner email, verifies the session with Auth,
and resolves the profile/game IDs itself. Sign-in uses `shouldCreateUser: false`.
Other emails get a generic response without an email being sent. Disable public
signup in Supabase too. Authenticated data and responses are uncached; only the
shared catalog and public sample retain the previous cache. No privileged key
or owner-email configuration is sent to the browser.

Commit saves optional score (0–100; null means unrated), independent tier
(S/A/B/C/D/F or unassigned), optional playback status, and a plain-text review
(20,000 characters maximum). See [Backlog and playback status](backlog-and-playback-status.md)
for the applied follow-up migration. Upsert keeps one current
rating per profile/game; an empty review clears it. Failed saves preserve drafts;
discard restores saved values. The applied
[saved play details](saved-play-details.md) milestone adds platform, hours, and
completion date; production rollout is authorized. Tags and curated lists are
implemented in the [pending next milestone](tags-and-curated-lists.md). Broadcast
remains temporary. Reviews render as escaped text.

## Rollout order

1. Migration `20260929021103_owner_rating_access.sql` is applied. Its filename
   matches the remote migration history; database types were regenerated.
2. Create the confirmed owner account administratively in Supabase Auth.
   Keep public signups disabled. Create a private, empty `sakapatate` profile
   linked to this account's UUID. Exact provisioning SQL is prepared locally in
   ignored `.env.owner-setup.sql`. Never insert real users directly into `auth.users`.
3. Set Auth Site URL to `https://playloggg.vercel.app`. Allow redirect URLs
   `https://playloggg.vercel.app/auth/confirm` and
   `http://localhost:3000/auth/confirm`. The default Magic Link template can be
   tested with the callback's PKCE authorization-code exchange. Open the email
   link in the same browser that requested it, where the verifier cookie exists.
   A custom template is optional and the hosted dashboard may require custom
   SMTP before allowing template changes. If configuring SMTP, this body supports
   the direct token-hash callback:

   ```html
   <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Sign in to Playlogg</a>
   ```

   The callback accepts either PKCE codes or token hashes. It verifies the owner's email and
   redirects to the fixed `/profile` destination. Invalid/expired links return
   to sign-in with a generic error. Tokens never appear in error messages.
4. Set Vercel Production `PLAYLOGG_OWNER_EMAIL` to the chosen email, and
   `PLAYLOGG_SITE_URL=https://playloggg.vercel.app`. Neither variable uses a
   public prefix. Existing public Supabase configuration remains required.
5. The user approved pushing this milestone to `main`. Verify real email delivery,
   owner sign-in, saving, refresh and sign-out in production.

The connector has no tools for creating Auth users or changing Auth settings;
these operations require dashboard or authorized Management/Admin API access.
Supabase's default email sender is limited to project organization team-member
addresses and currently two messages per hour. Creating an Auth user alone does
not authorize that email as a recipient. Configure custom SMTP for recipients
outside that set and reliable production delivery.

## Verification

Production build, TypeScript, lint, eight input/data tests and sample-seed parity
pass. A rolled-back transaction against the actual project tested the migration
and temporary owner fixtures: private reads, insert and upsert passed. Cross-owner
reads/writes, ownership reassignment, sample writes, anonymous writes, catalog
edits, profile claiming and deletion were denied. No test rows or schema changes
remain. After applying the migration, `supabase/tests/owner_rating_access.sql`
passed again against the deployed schema, and security advisors returned no findings.

An isolated local Auth/Data API verified owner-only magic-link requests, anonymous
save denial, score/tier/review saves, reload persistence, calculated profile
statistics, escaped review rendering and draft recovery after failed saves.
Sign-out restores the sample portfolio. The 390px mobile account screen was
visually checked with no horizontal overflow or browser runtime errors.
The user confirmed production magic-link sign-in works after configuring Auth
URLs and Vercel environment variables and redeploying. Production save/reload
verification remains; no test rating was written to the owner's profile.

References: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client),
[email templates](https://supabase.com/docs/guides/auth/auth-email-templates),
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
