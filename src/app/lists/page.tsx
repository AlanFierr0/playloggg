import type { Metadata } from "next";
import { CollectionsScreen } from "@/components/screens/collections-screen";
export const metadata: Metadata = { title: "Curated lists" };
export default function ListsPage() { return <CollectionsScreen />; }
