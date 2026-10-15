# Custom domain and email

The approved production address is `https://playlogg.alanfierro.dev`.
The apex `alanfierro.dev` stays available for a future personal website.
Cloudflare retains registration and authoritative DNS; Vercel hosts Playlogg.

## Website

- Vercel project: `playloggg`.
- Cloudflare CNAME `playlogg` points to
  `9770badd0e9fca9f.vercel-dns-017.com`, with DNS-only routing.
- Vercel Production `PLAYLOGG_SITE_URL` uses the new origin.
- Supabase Auth Site URL uses the new origin. Its redirect allowlist includes
  `/auth/confirm` and `/auth/confirm?flow=recovery` on that origin, while retaining
  the existing development and former production callback entries.
- Canonical metadata, robots and sitemap URLs use the new origin.
- The former `playloggg.vercel.app` address permanently redirects (308) to the
  new domain, preserving paths and query parameters.
- Accounts and saved data stay in the existing Supabase project. Browser sessions
  are domain-specific, so users must sign in again on the new address.

## Email

Cloudflare Email Routing forwards `support@alanfierro.dev` to the owner's verified
existing inbox. Catch-all routing stays disabled. Forwarding does not configure
Gmail to send replies from the custom address.

Resend's free plan is selected for outgoing authentication email. The sending
domain is verified with `resend._domainkey` TXT, DNS-only `rsend` and `send`
CNAMEs, and a monitoring-only `_dmarc` TXT record. Resend receiving stays disabled;
Cloudflare's apex MX records continue handling incoming mail.

Supabase SMTP is enabled with sender `support@alanfierro.dev`, name `Playlogg`,
host `smtp.resend.com`, port `465`, username `resend`, and its existing 60-second
per-user interval. The owner entered the credential privately and saved it;
the enabled configuration and stored credential persist after a dashboard reload.
Use a Resend sending-only key restricted to `alanfierro.dev`. Never commit SMTP
credentials or API keys.

## Verification on 2026-10-15

Vercel reports valid DNS configuration, and the new address returns HTTPS 200.
Cloudflare shows the support forwarding rule as Active, and Resend reports the
sending domain as Verified. The first authorized sign-in email test failed SMTP
authentication; after the owner replaced the API key privately, the retry through
the production site's email-link form succeeded. Resend reports the message
`Your sign-in link` to the owner's existing Gmail account as Delivered. Outgoing
authentication email is operational. Opening the received link to complete login,
password-reset delivery, and actual incoming support-mail forwarding have not
been tested in this run.
`pnpm build` passed after merging current GitHub main, including typecheck, lint
and all 127 tests. All 28 production route smoke checks passed. The old address
redirect preserves path/query, and the Steam POST handshake uses the new origin
for its realm and callback. A full Steam sign-in was not performed.

## Branded account emails

All six Supabase authentication templates use the Playlogg wordmark, charcoal
surfaces, amber actions and the site's light-mode colors. The email treatment
keeps the existing identity with low visual variance (3), no motion (1), and
comfortable content density (3). Each message has one primary action, short
context, a security note and a support link. Reauthentication displays the
provider's one-time code instead of a link.

The shared source is `scripts/build-auth-emails.mjs`. Run
`node scripts/build-auth-emails.mjs` to regenerate `supabase/templates/*.html`
and `subjects.json`. `supabase/config.toml` selects the same files and subjects
for local Auth. Hosted templates must be saved separately in Supabase's
Authentication > Emails dashboard; a Vercel deployment does not synchronize them.

The templates use presentation tables, inline CSS, system-font fallbacks,
hidden inbox preview text, and 320px-friendly spacing. They do not fetch images,
web fonts or tracking assets. Clients supporting light-mode media queries receive
the light palette; inline dark colors remain the fallback. Outlook receives a
fixed-width table fallback. The production templates contain no JavaScript.

Existing hosted `{{ .ConfirmationURL }}` links are preserved for sign-in,
confirmation, recovery, invitation and email change. Reauthentication preserves
`{{ .Token }}`, and email change preserves `{{ .NewEmail }}`. No authentication
routes, expiration settings, SMTP credentials or notification switches changed.
The old local owner-only sign-in copy is replaced with the current public-account
wording and the same confirmation URL behavior as the hosted project.

On 2026-10-15, all six hosted bodies were copied back through the dashboard editor
and matched the versioned HTML after newline normalization. All seven optional
security notifications remained disabled. The branded sign-in email sent through
the production form to the already approved owner inbox was reported Delivered
by Resend. No other message types were sent as tests.

The production build, typecheck, lint and all 130 tests passed. Three template
tests check generated-file consistency, provider placeholders, safe static
markup, local configuration and WCAG AA text contrast. Browser checks covered
all six messages in both palettes at desktop and 320px widths (24 layouts), with
no horizontal overflow. Native Gmail/Apple Mail/Outlook rendering and complete
sign-in/reset actions were not verified in this design run.
