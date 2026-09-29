"use client";

import { useActionState } from "react";
import { requestMagicLink } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(requestMagicLink, { message: "", sent: false });
  return <form action={action} className="space-y-5">
    <div className="space-y-2">
      <label htmlFor="login-email" className="block font-label-md text-label-md text-on-surface-variant">Email</label>
      <input id="login-email" name="email" type="email" autoComplete="email" required maxLength={254} className="w-full rounded bg-surface-container px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
    <button type="submit" disabled={pending} className="w-full rounded bg-primary-container px-5 py-3 font-label-md text-on-primary-container disabled:opacity-50">{pending ? "Sending…" : "Send sign-in link"}</button>
    <p role="status" className="font-body-sm text-body-sm text-on-surface-variant">{state.message}</p>
  </form>;
}
