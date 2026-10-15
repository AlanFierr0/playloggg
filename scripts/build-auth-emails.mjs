import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const emails = [
  { id: "magic-link", route: "magic-link-or-otp", subject: "Your Playlogg sign-in link", label: "Sign in", title: "Back to your games.", intro: "Use this one-time link to sign in to your Playlogg account.", action: "Sign in", note: "Open the link in the same browser where you requested it. If you didn't request this email, you can ignore it." },
  { id: "confirmation", route: "confirm-sign-up", subject: "Confirm your email for Playlogg", label: "Welcome to Playlogg", title: "Make it your Playlogg.", intro: "Confirm your email address to finish creating your account. Your next great game deserves a place here.", action: "Confirm email", note: "Open the link in the same browser where you signed up. If you didn't create this account, you can ignore this email." },
  { id: "recovery", route: "reset-password", subject: "Reset your Playlogg password", label: "Account recovery", title: "A fresh password.", intro: "We received a request to reset your Playlogg password. Choose a new one to get back to your games.", action: "Reset password", note: "Open the link in the same browser where you requested it. If this wasn't you, ignore this email. Your password will stay the same." },
  { id: "invite", route: "invite-user", subject: "You've been invited to Playlogg", label: "You're invited", title: "Your taste belongs here.", intro: "You've been invited to Playlogg. Accept your invitation to set up your account and start your gaming portfolio.", action: "Accept invitation", note: "If you weren't expecting this invitation, you can ignore this email." },
  { id: "email-change", route: "change-email-address", subject: "Confirm your new Playlogg email", label: "Email update", title: "A new address. Same you.", intro: "Confirm <strong>{{ .NewEmail }}</strong> as the new email address for your Playlogg account.", action: "Confirm email", note: "If you didn't request this change, don't confirm it. Contact support@alanfierro.dev for help." },
  { id: "reauthentication", route: "reauthentication", subject: "Your Playlogg verification code", label: "Account verification", title: "Just checking it's you.", intro: "Enter this one-time code in Playlogg to continue with your account action.", note: "Keep this code to yourself. Playlogg support will never ask you to share it. If you didn't request it, you can ignore this email." },
];

const lightStyles = `.email-bg{background-color:#faf9fd!important}.email-panel{background-color:#ffffff!important;border-color:#d4c5af!important;border-top-color:#ffc665!important}.email-text{color:#1c1b1f!important}.email-muted{color:#514637!important}.email-accent{color:#9a3412!important}.email-divider{border-color:#d4c5af!important}.email-code{background-color:#f4f3f7!important;color:#1c1b1f!important}.email-button{background-color:#ffc665!important;color:#281900!important}`;

export function renderEmail(email) {
  const action = email.action ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#ffc665" class="email-button" style="border-radius:6px;background-color:#ffc665;mso-padding-alt:16px 28px;text-align:center;"><a href="{{ .ConfirmationURL }}" class="email-button" style="display:inline-block;padding:16px 28px;border:1px solid #ffc665;border-radius:6px;background-color:#ffc665;color:#281900;font-size:16px;font-weight:700;line-height:20px;text-decoration:none;white-space:nowrap;">${email.action}</a></td></tr></table>` : `<p class="email-code" style="margin:0;padding:20px 12px;border:1px solid #504535;border-radius:6px;background-color:#121316;color:#e3e2e6;text-align:center;font-family:Consolas,'Courier New',monospace;font-size:32px;font-weight:700;letter-spacing:6px;line-height:1.4;">{{ .Token }}</p>`;
  const fallback = email.action ? `<tr><td class="email-muted" style="padding:22px 0 0;color:#d4c4b0;font-size:12px;line-height:19px;">Button not working? Copy this link into your browser:<br><a class="email-muted" href="{{ .ConfirmationURL }}" style="color:#d4c4b0;text-decoration:underline;word-break:break-all;overflow-wrap:anywhere;">{{ .ConfirmationURL }}</a></td></tr>` : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${email.subject}</title>
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}table{border-collapse:collapse}a:focus{outline:2px solid #ffc665;outline-offset:4px}@media(prefers-color-scheme:light){${lightStyles}}@media(max-width:620px){.email-outer{padding:24px 16px!important}.email-padding{padding:30px 24px!important}.email-heading{font-size:30px!important;line-height:36px!important}.email-footer{padding:24px 8px!important}}</style></head>
<body class="email-bg" bgcolor="#121316" style="margin:0;padding:0;width:100%;background-color:#121316;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;">
<div aria-hidden="true" style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${email.intro.replace(/<[^>]+>/g, "")}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-bg" bgcolor="#121316" style="width:100%;background-color:#121316;"><tr><td align="center" class="email-outer" style="padding:40px 24px;">
<!--[if mso]><table role="presentation" width="560" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;border-collapse:separate;border-spacing:0;">
<tr><td style="padding:0 0 28px;"><a href="https://playlogg.alanfierro.dev" class="email-text" style="color:#e3e2e6;font-family:'Space Grotesk',Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;letter-spacing:-1px;line-height:32px;text-decoration:none;">PLAYLOG<span class="email-accent" style="color:#ffc665;">.GG</span></a></td></tr>
<tr><td class="email-panel" bgcolor="#1b1b1f" style="border:1px solid #504535;border-top:3px solid #ffc665;border-radius:12px;background-color:#1b1b1f;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="email-padding" style="padding:38px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;width:100%;">
<tr><td class="email-accent" style="padding:0 0 16px;color:#ffc665;font-family:Consolas,'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:1.6px;line-height:18px;text-transform:uppercase;">${email.label}</td></tr>
<tr><td><h1 class="email-text email-heading" style="margin:0;color:#e3e2e6;font-family:'Space Grotesk',Arial,Helvetica,sans-serif;font-size:36px;font-weight:700;letter-spacing:-1.2px;line-height:42px;">${email.title}</h1></td></tr>
<tr><td class="email-muted" style="padding:20px 0 28px;color:#d4c4b0;font-size:16px;line-height:26px;overflow-wrap:anywhere;">${email.intro}</td></tr>
<tr><td>${action}</td></tr>
<tr><td class="email-muted" style="padding:26px 0 0;color:#d4c4b0;font-size:13px;line-height:21px;">${email.note}</td></tr>
<tr><td class="email-divider" style="padding:26px 0 0;border-bottom:1px solid #504535;"></td></tr>
${fallback}
<tr><td class="email-muted" style="padding:20px 0 0;color:#d4c4b0;font-size:13px;line-height:21px;">Need a hand? <a href="mailto:support@alanfierro.dev" class="email-muted" style="color:#d4c4b0;text-decoration:underline;">Contact support</a>.</td></tr>
</table></td></tr></table></td></tr>
<tr><td class="email-footer email-muted" style="padding:26px 2px;color:#d4c4b0;font-size:12px;line-height:20px;">Your games. Your taste.<br><a href="https://playlogg.alanfierro.dev" class="email-muted" style="color:#d4c4b0;text-decoration:underline;">playlogg.alanfierro.dev</a></td></tr>
</table><!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>\n`;
}

export async function buildEmails() {
  const directory = new URL("../supabase/templates/", import.meta.url);
  await mkdir(directory, { recursive: true });
  for (const email of emails) await writeFile(new URL(`${email.id}.html`, directory), renderEmail(email));
  await writeFile(new URL("subjects.json", directory), `${JSON.stringify(Object.fromEntries(emails.map(email => [email.id, email.subject])), null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildEmails();
  console.log(`Built ${emails.length} Supabase authentication email templates.`);
}
