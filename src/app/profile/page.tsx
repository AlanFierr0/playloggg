import type { Metadata } from "next";
import { RankingsScreen } from "@/components/screens/rankings-screen";
export const metadata: Metadata = { title: "My rankings", description: "Personal game rankings and ratings. Sample profile for the Playlogg prototype." };
export default function ProfilePage() { return <RankingsScreen />; }
