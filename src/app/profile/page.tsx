import { loginHref } from "@/lib/return-navigation";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/owner";
import { RouteLoading } from "@/components/route-loading";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPersonalPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { ProfileHotTake } from "@/components/profile-hot-take";
import { ProfileOverviewScreen } from "@/components/screens/profile-overview-screen";
export async function generateMetadata() { return localizeMetadata({ title: "My gaming identity", description: "Your gaming profile, independent favorites and saved entries.", robots: {index:false,follow:false} }); }
async function ProfileContent() { const portfolio = await getPersonalPortfolio(false); return <PortfolioProvider portfolio={portfolio}><ProfileOverviewScreen hotTake={<Suspense fallback={null}><ProfileHotTake portfolio={portfolio} /></Suspense>} /></PortfolioProvider>; }

export default async function ProfilePage(){
 const account=await getAccount();
 if(!account)redirect(loginHref("/profile"));
 if(!account.profile)redirect("/signup?next=/profile");
 return <Suspense fallback={<RouteLoading/>}><ProfileContent/></Suspense>;
}
