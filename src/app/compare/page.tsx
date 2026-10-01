import { localizeMetadata } from "@/lib/locale/server";
import { CompareScreen } from "@/components/screens/compare-screen";
export async function generateMetadata() { return localizeMetadata({ title: "Compare gaming taste", description: "Explore a sample comparison of shared games and ratings. Prototype metrics are illustrative." }); }
export default function ComparePage() { return <CompareScreen />; }
