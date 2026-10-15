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
- Accounts and saved data stay in the existing Supabase project. Browser sessions
  are domain-specific, so users must sign in again on the new address.

## Email

Cloudflare Email Routing forwards `support@alanfierro.dev` to the owner's verified
existing inbox. Catch-all routing stays disabled. Forwarding does not configure
Gmail to send replies from the custom address.

Outgoing authentication email setup is in progress. It requires a verified sending
domain and SMTP credentials in Supabase. Do not replace Cloudflare's apex MX
records when verifying a sending service; use its supplied bounce-subdomain
records and DKIM records. Never commit SMTP credentials or API keys.

## Verification on 2026-10-15

Vercel reports valid DNS configuration, and the new address returns HTTPS 200.
Cloudflare shows the support forwarding rule as Active. Inbox delivery and
authentication on the new domain still require end-to-end verification.
`pnpm build` passed, including typecheck, lint and all 84 existing tests.
