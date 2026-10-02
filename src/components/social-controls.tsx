"use client";
import { useActionState } from "react";
import { socialAction } from "@/app/actions/social";
import { useMessages } from "@/components/site-preferences";
export function SocialControls({
  target,
  followed = false,
  blocked = false,
  like = false,
  liked = false,
}: {
  target: number;
  followed?: boolean;
  blocked?: boolean;
  like?: boolean;
  liked?: boolean;
}) {
  const t = useMessages(),
    [state, action, pending] = useActionState(socialAction, { message: "" });
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {(like
          ? [
              {
                operation: liked ? "unlike" : "like",
                label: liked ? "Unlike" : "Like",
              },
            ]
          : [
              {
                operation: followed ? "unfollow" : "follow",
                label: followed ? "Unfollow" : "Follow",
              },
            ]
        )
          .filter((item) => !(blocked && item.operation === "follow"))
          .map((item) => (
            <form key={item.operation} action={action}>
              <input type="hidden" name="target" value={target} />
              <input type="hidden" name="operation" value={item.operation} />
              <button
                disabled={pending}
                className="rounded bg-surface-container px-4 py-3 text-primary disabled:opacity-40"
              >
                {t(item.label)}
              </button>
            </form>
          ))}
      </div>
      <p role="status" className="text-body-sm text-on-surface-variant">
        {t(state.message)}
      </p>
    </div>
  );
}
