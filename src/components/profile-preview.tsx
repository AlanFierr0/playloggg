import { getMessages } from "@/lib/locale/server";
import type { Game } from "@/types/domain";

// Presentation only: this illustration never enters personal or community records.
export async function ProfilePreview({ games }: { games: Game[] }) {
  const t = await getMessages();
  const covers = games.slice(0, 4);
  if (!covers.length) return null;
  return (
    <figure aria-label={t("Profile preview")} className="min-w-0 rounded-xl border border-outline-variant/40 bg-surface-container-low p-5 sm:p-7 space-y-6">
      <figcaption className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-headline-lg text-headline-lg">{t("A place for your favorites")}</span>
        <span className="text-body-sm text-on-surface-variant">{t("Profile preview")}</span>
      </figcaption>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {covers.map(game => <div key={game.slug} className="min-w-0 space-y-2">
          <img src={game.cover} alt={game.title} width={180} height={240} className="aspect-[3/4] w-full rounded-lg object-cover bg-surface-container-high" />
          <p translate="no" className="line-clamp-2 text-body-sm text-on-surface-variant">{game.title}</p>
        </div>)}
      </div>
      <div className="border-t border-outline-variant/30 pt-5 space-y-4">
        <p className="text-body-sm text-on-surface-variant">{t("Example rating and tier")}</p>
        <div className="flex items-center gap-4">
          <img src={covers[0].cover} alt="" width={48} height={64} className="w-12 aspect-[3/4] rounded-lg object-cover" />
          <div className="min-w-0 flex-1"><p translate="no" className="font-headline-md text-headline-md break-words">{covers[0].title}</p><p className="text-body-sm text-on-surface-variant">{t("Completed")}</p></div>
          <div className="shrink-0 text-right"><p className="font-label-lg text-primary">92 <span className="text-on-surface-variant">/ 100</span></p><p className="text-body-sm text-on-surface-variant">{t("Tier S")}</p></div>
        </div>
      </div>
      <p className="text-body-sm text-on-surface-variant">{t("Illustrative layout. Your profile starts empty and private.")}</p>
    </figure>
  );
}
