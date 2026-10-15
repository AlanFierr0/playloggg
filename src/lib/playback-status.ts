import type { PlaybackStatus } from "@/types/domain";

export const playbackLabels: Record<PlaybackStatus, string> = {
  completed: "Completed", playing: "In Progress", backlog: "Backlog", shelved: "Shelved",
  active: "Currently playing", paused: "Paused", stopped: "Stopped playing",
};

export function isPlaybackStatus(value: unknown): value is PlaybackStatus {
  return typeof value === "string" && Object.hasOwn(playbackLabels, value);
}

export type PlayStyle = "campaign" | "ongoing";
export const playbackGroups:Record<PlayStyle,PlaybackStatus[]> = {
  campaign:["completed","playing","backlog","shelved"],
  ongoing:["active","paused","stopped","backlog"],
};
export function statusPlayStyle(status:PlaybackStatus|null):PlayStyle|null {
  if(!status||status==="backlog")return null;
  return playbackGroups.ongoing.includes(status)?"ongoing":"campaign";
}
export function classifyPlayStyle(value:unknown):PlayStyle|null {
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const record=value as Record<string,unknown>;
  const names=(value:unknown)=>Array.isArray(value)?value.slice(0,50).flatMap(item=>{
    const name=typeof item==="string"?item:item&&typeof item==="object"?item.name:null;
    return typeof name==="string"?[name.toLowerCase().trim()]:[];
  }):[];
  const modes=names(record.game_modes),keywords=names(record.keywords),genres=names(record.genres);
  // Multiplayer/co-op alone does not imply a live-service game.
  if(modes.some(mode=>["massively multiplayer online (mmo)","mmo"].includes(mode))||keywords.some(word=>["live service","live-service","games as a service","game as a service"].includes(word))||genres.includes("moba"))return "ongoing";
  return modes.includes("single player")?"campaign":null;
}
