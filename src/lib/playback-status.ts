import type { PlaybackStatus } from "@/types/domain";

export const playbackLabels: Record<PlaybackStatus, string> = {
  completed: "Completed", playing: "In Progress", backlog: "Backlog", shelved: "Shelved",
  active: "Currently playing", paused: "Paused", stopped: "Stopped playing",
};

export function isPlaybackStatus(value: unknown): value is PlaybackStatus {
  return typeof value === "string" && Object.hasOwn(playbackLabels, value);
}
