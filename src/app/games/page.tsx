import type { Metadata } from "next";
import { GamesScreen } from "@/components/screens/games-screen";

export const metadata: Metadata = { title: "Games", description: "Browse the saved game catalog by title, genre, platform and release year, or filter by your log entries." };
export default function GamesPage() { return <GamesScreen />; }
