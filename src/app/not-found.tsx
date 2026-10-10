import { getMessages } from "@/lib/locale/server";
import Link from "next/link";
import Image from "next/image";

export default async function NotFound() {
  const t = await getMessages();
  return (
    <section className="site-container mx-auto grid min-h-[65dvh] w-full items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1.25fr] md:gap-12 md:py-16 lg:px-12">
      <div className="order-2 min-w-0 space-y-6 md:order-1">
        <p className="font-label-md text-label-md text-primary">{t("Error 404")}</p>
        <h1 className="max-w-[15ch] font-headline-xl text-[36px] font-semibold leading-[1.1] tracking-tight sm:text-[48px] lg:text-[56px]">{t("You took a wrong warp.")}</h1>
        <p className="max-w-md text-body-lg leading-relaxed text-on-surface-variant">{t("There is no level on the other side of this portal. Head home or find your next game.")}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/" className="ui-action bg-primary text-on-primary hover:bg-primary-container"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">arrow_back</span>{t("Go home")}</Link>
          <Link href="/search?q=&from=/" className="ui-action border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container-high"><span aria-hidden="true" className="material-symbols-outlined text-[20px]">search</span>{t("Search games")}</Link>
        </div>
      </div>
      <div aria-hidden="true" className="order-1 relative min-w-0 md:order-2">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 font-label-md text-label-md text-on-surface-variant">
          <span>{t("Level not found")}</span>
          <span className="text-primary">404</span>
        </div>
        <Image src="/images/wrong-warp.webp" alt="" width={1536} height={1024} priority sizes="(min-width: 768px) 55vw, 100vw" className="h-auto w-full" />
        <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {t("Return to your last checkpoint")}
        </div>
      </div>
    </section>
  );
}
