"use client";
import { useActionState } from "react";
import { socialAction } from "@/app/actions/social";
import { useMessages } from "@/components/site-preferences";
export function SocialControls({
  target,
  followed = false,
  blocked = false,
}: {
  target: number;
  followed?: boolean;
  blocked?: boolean;
}) {
  const t = useMessages(),
    [state, action, pending] = useActionState(socialAction, { message: "" });
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {(!blocked || followed) && <form action={action}>
          <input type="hidden" name="target" value={target} />
          <input type="hidden" name="operation" value={followed ? "unfollow" : "follow"} />
          <button disabled={pending} className="rounded bg-surface-container px-4 py-3 text-primary disabled:opacity-40">
            {t(followed ? "Unfollow" : "Follow")}
          </button>
        </form>}
      </div>
      <p role="status" className="text-body-sm text-on-surface-variant">
        {t(state.message)}
      </p>
    </div>
  );
}
