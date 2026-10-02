import { localizeMetadata } from "@/lib/locale/server";
import { CompareScreen } from "@/components/screens/compare-screen";
import { getOwnerComparison, getPublicComparison } from "@/lib/public-comparison";
import { getAccount } from "@/lib/owner";
export async function generateMetadata() { return localizeMetadata({ title: "Compare gaming taste", description: "Compare shared games, saved scores and independent tiers from two published profiles." }); }
export default async function ComparePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const [query, account]=await Promise.all([searchParams, getAccount()]);
  const handle=(value:string|string[]|undefined) => (typeof value === "string" ? value : "").trim().toLowerCase().slice(0,100);
  const requestedLeft=handle(query.left), requestedRight=handle(query.right);
  const ownHandle=account?.profile?.handle;
  const left=ownHandle ?? requestedLeft;
  const right=ownHandle && requestedRight===ownHandle && requestedLeft && requestedLeft!==ownHandle ? requestedLeft : requestedRight;
  const comparison=left && right ? await (ownHandle ? getOwnerComparison(right) : getPublicComparison(left,right)) : null;
  const rawPage=typeof query.page === "string" ? query.page : "";
  const page=/^[1-9]\d{0,6}$/.test(rawPage) ? Number(rawPage) : 1;
  return <CompareScreen left={left} right={right} comparison={comparison} requestedPage={page} ownProfile={Boolean(ownHandle)} />;
}
