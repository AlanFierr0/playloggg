import type { Metadata } from "next";
import { TiersScreen } from "@/components/screens/tiers-screen";
export const metadata: Metadata = { title: "Personal tier board", description: "A personal S, A, B, C, D and F game tier board. Sample prototype content." };
export default function TiersPage() { return <TiersScreen />; }
