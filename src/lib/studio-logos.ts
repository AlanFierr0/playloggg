const logos: Record<string, string> = {
  valve: "valve", "valve corporation": "valve", "valve software": "valve",
  ubisoft: "ubisoft", "rockstar games": "rockstargames", "epic games": "epicgames",
  "riot games": "riotgames", "remedy entertainment": "remedyentertainment",
  "square enix": "squareenix", sega: "sega", konami: "konami",
  activision: "activision", "cd projekt": "cdprojekt",
};

export function studioLogo(name: string): string | null {
  const normalized = name.trim().toLowerCase();
  const logo = logos[normalized] ?? (/^ubisoft (?:montreal|quebec|toronto|massive|bucharest|sofia|paris|reflections|singapore|montpellier|san francisco|annecy|shanghai|chengdu|kyiv|odesa)$/.test(normalized) ? "ubisoft" : /^square enix (?:business division|creative business unit) /.test(normalized) ? "squareenix" : null);
  return typeof logo === "string" ? `/images/studios/${logo}.svg` : null;
}
