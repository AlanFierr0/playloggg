"use client";
import { useActionState, useState } from "react";
import { emailPassword, changePassword } from "@/app/actions/password";
import { useMessages } from "@/components/site-preferences";

const input = "w-full rounded-xl bg-surface-container px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary";
const button = "w-full rounded-xl bg-primary-container px-5 py-3 font-semibold text-on-primary-container disabled:opacity-50";
export function PasswordForm({initialMode="signin"}:{initialMode?:"signin"|"register"}) {
  const t = useMessages();
  const [mode, setMode] = useState<"signin" | "register" | "recover" | "link">(initialMode);
  return <div className="space-y-5">
    <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-container p-1" aria-label={t("Email sign-in options")}>
      {(["signin", "register", "link"] as const).map(option => <button key={option} type="button" aria-pressed={mode === option} onClick={() => setMode(option)} className={`px-3 py-2.5 font-label-md ${mode === option ? "bg-surface-container-high text-primary" : "text-on-surface-variant"}`}>{t(option === "signin" ? "Sign in" : option === "register" ? "Create account" : "Email link")}</button>)}
    </div>
    <EmailForm key={mode} mode={mode} />
    <button type="button" onClick={() => setMode(mode === "recover" || mode === "link" ? "signin" : "recover")} className="text-primary underline underline-offset-4 text-body-sm">{t(mode === "recover" || mode === "link" ? "Back to sign in" : "Forgot password?")}</button>
  </div>;
}
function EmailForm({mode}: {mode: "signin" | "register" | "recover" | "link"}) {
  const t = useMessages();
  const [state, action, pending] = useActionState(emailPassword, {message: ""});
  const [show, setShow] = useState(false);
  return <form action={action} className="space-y-4">
    <input type="hidden" name="mode" value={mode} />
    {mode === "link" && <p className="text-on-surface-variant text-body-sm">{t("Get a one-time sign-in link by email. No password needed.")}</p>}
    {mode === "recover" && <h2 className="font-headline-md text-headline-md">{t("Reset your password")}</h2>}
    <label className="block space-y-2"><span>{t("Email")}</span><input name="email" type="email" autoComplete="email" required maxLength={254} className={input} disabled={pending} /></label>
    {mode !== "recover" && mode !== "link" && <div className="space-y-2"><label htmlFor="account-password">{t("Password")}</label><div className="relative"><input id="account-password" name="password" type={show ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} required minLength={mode === "register" ? 12 : 1} maxLength={128} className={`${input} pr-20`} disabled={pending} /><button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-2 text-primary text-body-sm" aria-label={t(show ? "Hide password" : "Show password")}>{t(show ? "Hide" : "Show")}</button></div>{mode === "register" && <p className="text-on-surface-variant text-body-sm">{t("Use at least 12 characters. Your profile starts private.")}</p>}</div>}
    <button disabled={pending} className={button}>{t(pending ? "Please wait…" : mode === "register" ? "Create account" : mode === "recover" ? "Send reset link" : mode === "link" ? "Send sign-in link" : "Sign in with email")}</button>
    <p role="status" className="text-primary text-body-sm break-words">{t(state.message)}</p>
  </form>;
}
export function NewPasswordForm() {
  const t = useMessages();
  const [state, action, pending] = useActionState(changePassword, {message: ""});
  return <form action={action} className="space-y-5">{["password", "confirmPassword"].map(name => <label key={name} className="block space-y-2"><span>{t(name === "password" ? "New password" : "Confirm password")}</span><input name={name} type="password" required minLength={12} maxLength={128} autoComplete="new-password" disabled={pending} className={input} /></label>)}<button disabled={pending} className={button}>{t(pending ? "Saving…" : "Save password")}</button><p role="status" className="text-primary">{t(state.message)}</p></form>;
}
