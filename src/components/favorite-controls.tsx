"use client";
import { useActionState } from "react";
import { updateFavorite } from "@/app/actions/favorites";
import { useMessages } from "@/components/site-preferences";
import type { Favorite } from "@/types/domain";

export function FavoriteControls({ slug, favorite }: { slug: string; favorite?: Favorite }) {
  const t = useMessages();
  const [state, action, pending] = useActionState(updateFavorite, { message: "" });
  return <div className="space-y-3">
    <form action={action}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="operation" value={favorite ? "remove" : "add"} />
      <button disabled={pending} className="min-h-11 text-primary font-label-md disabled:opacity-50">{pending ? t("Saving…") : favorite ? t("Remove favorite") : t("Add favorite")}</button>
    </form>
    {favorite && <form action={action} className="space-y-2">
      <input type="hidden" name="slug" value={slug} /><input type="hidden" name="operation" value="feature" />
      <label className="block text-body-sm"><span className="block mb-2">{t("Featured position")}</span>
        <select key={favorite.featuredSlot ?? "none"} name="slot" defaultValue={favorite.featuredSlot ?? ""} disabled={pending} className="w-full min-h-11 rounded bg-surface-container p-2">
          <option value="">{t("Not featured")}</option>{[1, 2, 3, 4].map(slot => <option key={slot} value={slot}>#{slot}</option>)}
        </select>
      </label><button disabled={pending} className="min-h-11 text-primary font-label-md disabled:opacity-50">{t("Save position")}</button>
    </form>}
    <p role="status" className="text-body-sm text-on-surface-variant break-words">{t(state.message)}</p>
  </div>;
}
