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
sending domain as Verified. Inbox delivery and authentication on the new domain
still require end-to-end verification; the SMTP credential is saved.
`pnpm build` passed after merging current GitHub main, including typecheck, lint
and all 127 tests. All 28 production route smoke checks passed. The old address
redirect preserves path/query, and the Steam POST handshake uses the new origin
for its realm and callback. A full Steam sign-in was not performed.
