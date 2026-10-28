import Link from "next/link";
import { BackLink } from "@/components/return-navigation";
import { getMessages, localizeMetadata } from "@/lib/locale/server";

export async function generateMetadata() { return localizeMetadata({title: "How your data is used", description: "Profile visibility, Steam connections, translations and account controls in Playlogg."}); }
export default async function DataUsePage() {
  const t = await getMessages();
  const sections = [
    {id:"profiles",title:"Your profile and saved games",body:"Profiles start public and discoverable. You can change visibility and discovery in Settings. Your ratings, reviews, hours, completion dates and favorites belong to your profile."},
    {id:"steam",title:"Connecting Steam",body:"Steam sign-in verifies your Steam identity. Import and sync read your available library and playtime; completion suggestions also read achievements. Steam Game details must be public for these reads. Connecting Steam never merges two Playlogg profiles."},
    {id:"ai",title:"Achievement suggestions",body:"When AI assistance is available, Gemini receives public game and achievement descriptions to identify completion achievements. Steam IDs, playtime and personal unlock dates are not included in that classification request. Results are cached per game. You must confirm a suggestion before it changes your log."},
    {id:"translations",title:"Review translations",body:"Review prose may be sent to DeepL when another interface language is selected. Playlogg caches translations for the review and language to avoid repeating requests. The original review stays unchanged and Show original remains available. Cached translations follow the review’s access rules."},
    {id:"storage",title:"Drafts and browser preferences",body:"Theme and language use cookies. Unfinished editor drafts use storage in this browser tab. Steam import and rating recovery use this browser’s storage. Avoid leaving unfinished drafts on shared devices."},
    {id:"account",title:"Exporting and deleting your account",body:"Settings lets you export your saved data as JSON or CSV. Delete account requires confirmation and removes your account, profile, logs, reviews, favorites and uploaded pictures. Shared catalog games remain available to other players."},
  ];
  return <section className="site-container mx-auto w-full px-4 py-8 sm:px-6 lg:px-12 space-y-8">
    <BackLink href="/" className="inline-flex min-h-11 items-center text-primary">← {t("Back")}</BackLink>
    <header className="max-w-3xl space-y-3"><h1 className="font-headline-xl text-headline-xl">{t("How your data is used")}</h1><p className="text-body-lg text-on-surface-variant">{t("Understand what you share and which controls are yours.")}</p></header>
    <nav aria-label={t("Data use topics")} className="flex max-w-3xl flex-wrap gap-2">{sections.map(section=><a key={section.id} href={`#${section.id}`} className="inline-flex min-h-11 items-center rounded-lg bg-surface-container-low px-3 text-body-sm text-primary">{t(section.title)}</a>)}</nav>
    <div className="max-w-3xl space-y-6">{sections.map(section=><section id={section.id} key={section.id} className="scroll-mt-24 rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 sm:p-6 space-y-3"><h2 className="font-headline-lg text-headline-lg">{t(section.title)}</h2><p className="leading-relaxed text-on-surface-variant">{t(section.body)}</p></section>)}
      <div className="flex flex-wrap gap-4"><Link href="/settings" className="inline-flex min-h-11 items-center rounded-xl bg-primary-container px-5 text-on-primary-container">{t("Profile settings")}</Link><a href="https://github.com/AlanFierr0/playloggg/issues" className="inline-flex min-h-11 items-center text-primary">{t("Feedback and bug reports")}</a></div>
    </div>
  </section>;
}
