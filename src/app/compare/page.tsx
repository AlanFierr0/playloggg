import type { Metadata } from "next";
import { CompareScreen } from "@/components/screens/compare-screen";
export const metadata: Metadata = { title: "Compare gaming taste", description: "Explore a sample comparison of shared games and ratings. Prototype metrics are illustrative." };
export default function ComparePage() { return <CompareScreen />; }
