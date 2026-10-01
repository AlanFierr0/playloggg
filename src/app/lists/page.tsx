import { localizeMetadata } from "@/lib/locale/server";
import { CollectionsScreen } from "@/components/screens/collections-screen";
export async function generateMetadata() { return localizeMetadata({ title: "Curated lists" }); }
export default function ListsPage() { return <CollectionsScreen />; }
