import { getPersonalPortfolio, getCatalog } from "@/lib/portfolio";
import { getAccount } from "@/lib/owner";
import { gamingYear, yearGames, type GamingEvent } from "@/lib/gaming-year";
import { getMessages, localizeMetadata } from "@/lib/locale/server";
import { TasteDetails } from "@/components/taste-details";
import { ShareCardControls } from "@/components/share-card-controls";
export async function generateMetadata() {
  return localizeMetadata({
    title: "Year in Gaming",
    robots: { index: false, follow: false },
  });
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const query = await searchParams,
    year = /^20\d{2}$/.test(query.year ?? "")
      ? Number(query.year)
      : new Date().getUTCFullYear();
  const [portfolio, account, t, rows] = await Promise.all([
    getPersonalPortfolio(),
    getAccount(),
    getMessages(),
    getCatalog(),
  ]);
  const events: GamingEvent[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await account!.supabase
      .from("profile_activity")
      .select("game_id,kind,score,score_changed,completion_changed,occurred_at")
      .eq("profile_id", account!.profile!.id)
      .gte("occurred_at", `${year}-01-01T00:00:00Z`)
      .lt("occurred_at", `${year + 1}-01-01T00:00:00Z`)
      .order("id")
      .range(offset, offset + 499);
    if (error) throw new Error("Year in Gaming could not be loaded.");
    events.push(...data);
    if (data.length < 500) break;
  }
  const summary = gamingYear(events, year),
    games = yearGames(summary, rows, portfolio.games);
  return (
    <section className="site-container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8">
      <h1 className="font-headline-xl text-headline-xl">
        {portfolio.profile.displayName} · {year} {t("Year in Gaming")}
      </h1>
      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="space-y-2">
          <span className="block">{t("Year")}</span>
          <input
            name="year"
            type="number"
            min={2000}
            max={2099}
            defaultValue={year}
            className="rounded bg-surface-container p-3"
          />
        </label>
        <button className="rounded bg-primary text-on-primary px-4 py-3">
          {t("Show year")}
        </button>
      </form>
      <p className="text-on-surface-variant">
        {t(
          "Only activity recorded since this feature launched is included. Calendar years use UTC; old entries are not backfilled.",
        )}
      </p>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {[
          { label: "Games rated", value: summary.scored },
          { label: "Completed games", value: summary.completed },
          { label: "Average score", value: summary.average ?? "—" },
          { label: "Favorites added", value: summary.favorites },
        ].map(({ label, value }) => (
          <div key={label}>
            <dt className="text-on-surface-variant">{t(label)}</dt>
            <dd className="text-primary font-headline-xl text-headline-xl">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {games[0] && (
        <section className="flex gap-5 items-center">
          <img
            src={games[0].cover}
            alt=""
            className="w-24 aspect-[3/4] object-cover rounded"
          />
          <div>
            <h2 className="font-headline-lg text-headline-lg">
              {t("Highest recorded score")}
            </h2>
            <p translate="no">
              {games[0].title} · {games[0].score}
            </p>
          </div>
        </section>
      )}
      <section className="space-y-3">
        <h2 className="font-headline-lg text-headline-lg">
          {t("Monthly activity")}
        </h2>
        {summary.months.map(([month, count]) => (
          <p key={month}>
            {month} · {count} {t("recorded updates")}
          </p>
        ))}
      </section>
      <TasteDetails games={games} />
      <ShareCardControls
        endpoint={`/api/share/profile?kind=wrapped&year=${year}`}
      />
      {!events.length && (
        <p className="text-on-surface-variant">
          {t("No recorded activity for this year yet.")}
        </p>
      )}
    </section>
  );
}
