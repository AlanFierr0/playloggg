import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/owner";
import { RouteLoading } from "@/components/route-loading";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { getPersonalPortfolio } from "@/lib/portfolio";
import { localizeMetadata } from "@/lib/locale/server";
import { ProfileOverviewScreen } from "@/components/screens/profile-overview-screen";
export async function generateMetadata() { return localizeMetadata({ title: "My gaming identity", description: "Your gaming profile, independent favorites and saved entries.", robots: {index:false,follow:false} }); }
async function ProfileContent() { return <PortfolioProvider portfolio={await getPersonalPortfolio()}><ProfileOverviewScreen /></PortfolioProvider>; }

export default async function ProfilePage(){
 const account=await getAccount();
 if(!account)redirect("/login");
 if(!account.profile)redirect("/signup");
 return <Suspense fallback={<RouteLoading/>}><ProfileContent/></Suspense>;
}
