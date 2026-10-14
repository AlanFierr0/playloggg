import { isCalendarDate } from "./rating-input.ts";
export type SteamCompletionCandidate = { id:string; name:string; description:string; date:string; unlockedAt:number };
export function completionAchievement(name:string,description:string):boolean {
  const text=`${name}. ${description}`.toLowerCase();
  // shortcut: English text is evidence, not proof; user confirmation is required for every match.
  if(/\b(dlc|expansion|downloadable content)\b/.test(text))return false;
  return text.split(/[.!;\n]/).some(clause=>{
    if (/\b(not|never|don’t|don't)\b/.test(clause))return false;
    if (/\b(chapter|level|tutorial|match|round|dlc|expansion|downloadable content)\b/.test(clause)) return false;
    return /\b(complet(?:e|ed|ing)|finish(?:ed|ing)?|beat|beaten)\b.{0,45}\b((?:main )?story|campaign|(?:the )?game|main quest)\b/.test(clause)
      || /\b(reach(?:ed)?|unlock(?:ed)?|achiev(?:e|ed)|see|seen|watch(?:ed)?|obtain(?:ed)?)\b.{0,35}\b(?:ending|end of the story)\b/.test(clause)
      || /\bdefeat(?:ed)?\b.{0,25}\bfinal boss\b/.test(clause);
  });
}
export function parseSteamCompletions(value:unknown,appId:number,releasedOn:string|null,now=Date.now()):SteamCompletionCandidate[] {
  if (!value||typeof value!=="object"||!("playerstats" in value)) throw new Error("Steam achievements unavailable");
  const stats=value.playerstats as Record<string,unknown>|null;
  if (!stats||stats.success!==true||(typeof stats.gameID!=="string"&&typeof stats.gameID!=="number")||Number(stats.gameID)!==appId||!Array.isArray(stats.achievements)) throw new Error("Steam achievements unavailable");
  const candidates=new Map<string,SteamCompletionCandidate>();
  for(const raw of stats.achievements.slice(0,5000)) {
    if(!raw||typeof raw!=="object")continue;
    const {apiname:id,name,description,achieved,unlocktime}=raw;
    if(achieved!==1||typeof id!=="string"||!id||id.length>256||typeof name!=="string"||name.length>500||typeof description!=="string"||description.length>4000||!Number.isSafeInteger(unlocktime)||unlocktime<=0||unlocktime>now/1000)continue;
    const date=new Date(unlocktime*1000).toISOString().slice(0,10);
    if(!isCalendarDate(date)||(releasedOn&&date<releasedOn)||!completionAchievement(name,description))continue;
    candidates.set(id,{id,name,description,date,unlockedAt:unlocktime});
  }
  return [...candidates.values()].sort((a,b)=>a.unlockedAt-b.unlockedAt||a.id.localeCompare(b.id));
}
