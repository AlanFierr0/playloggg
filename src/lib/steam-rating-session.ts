import type { LibraryRow, ImportedSteamRating } from "../app/actions/steam-library.ts";
import { isCalendarDate } from "./rating-input.ts";
import { playbackLabels, type PlayStyle } from "./playback-status.ts";
import type { Tier, PlaybackStatus } from "../types/domain.ts";

export type SteamRatingGame = LibraryRow & ImportedSteamRating;
export type SteamRatingDraft = { score: string; tier: Tier|null; status: PlaybackStatus|null; completedOn?:string; playStyle?:PlayStyle|null };
export const emptySteamRatingDraft: SteamRatingDraft = {score:"",tier:null,status:null,completedOn:""};
export function readSteamRatingSession(raw: string) {
  const value = JSON.parse(raw);
  if (!value || !Array.isArray(value.games) || !value.games.length || value.games.length>10000 || !Number.isInteger(value.index) || value.index<0 || value.index>value.games.length || !Number.isInteger(value.target) || value.target<value.games.length || !Number.isInteger(value.progress) || !Number.isInteger(value.total) || value.progress<0 || value.total<value.progress) return null;
  if (!value.games.every((game: SteamRatingGame)=>game && Number.isSafeInteger(game.appId) && game.appId>0 && typeof game.slug==="string" && typeof game.title==="string" && Number.isFinite(game.hours) && game.hours>=0 && (game.cover===null || typeof game.cover==="string") && (game.updatedAt===null || typeof game.updatedAt==="string"))) return null;
  const draft = value.draft;
  if(draft?.playStyle!==undefined&&draft.playStyle!==null&&draft.playStyle!=="campaign"&&draft.playStyle!=="ongoing")return null;
  if (!draft || typeof draft.score!=="string" || !/^\d{0,3}$/.test(draft.score) || Number(draft.score)>100 || (draft.tier!==null && !["S","A","B","C","D","F"].includes(draft.tier)) || (draft.status!==null && !Object.hasOwn(playbackLabels,draft.status))) return null;
  if(draft.completedOn!==undefined && draft.completedOn!=="" && !isCalendarDate(draft.completedOn))return null;
  draft.completedOn ??= "";
  return value as {games:SteamRatingGame[];index:number;target:number;progress:number;total:number;draft:SteamRatingDraft};
}

