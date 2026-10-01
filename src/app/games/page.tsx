import { localizeMetadata } from "@/lib/locale/server";
import { GamesScreen } from "@/components/screens/games-screen";

export async function generateMetadata() { return localizeMetadata({ title: "Games", description: "Browse the saved game catalog by title, genre, platform and release year, or filter by your log entries." }); }
export default function GamesPage() { return <GamesScreen />; }
