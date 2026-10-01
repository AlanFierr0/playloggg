import { localizeMetadata } from "@/lib/locale/server";
import { CompareScreen } from "@/components/screens/compare-screen";
import { getPublicComparison } from "@/lib/public-comparison";
export async function generateMetadata() { return localizeMetadata({ title: "Compare gaming taste", description: "Compare shared games, saved scores and independent tiers from two published profiles." }); }
export default async function ComparePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const query=await searchParams;
  const handle=(value:string|string[]|undefined) => (typeof value === "string" ? value : "").trim().toLowerCase().slice(0,100);
  const left=handle(query.left), right=handle(query.right);
  const comparison=left && right ? await getPublicComparison(left,right) : null;
  const rawPage=typeof query.page === "string" ? query.page : "";
  const page=/^[1-9]\d{0,6}$/.test(rawPage) ? Number(rawPage) : 1;
  return <CompareScreen left={left} right={right} comparison={comparison} requestedPage={page} />;
}
