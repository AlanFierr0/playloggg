// Only pass an Auth-verified user; editable user_metadata is never an identity.
export function eligibleAccount(user: { email?: string; email_confirmed_at?: string; is_anonymous?: boolean; app_metadata: Record<string, unknown> }) {
  if (user.is_anonymous) return false;
  const steam = user.app_metadata.playlogg_steam_id;
  return (typeof steam === "string" && /^7656119\d{10}$/.test(steam)) || Boolean(user.email && user.email_confirmed_at && !user.email.endsWith("@users.playlogg.invalid"));
}
