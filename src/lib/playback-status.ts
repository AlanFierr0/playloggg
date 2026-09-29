import type { PlaybackStatus } from "@/types/domain";

export const playbackLabels: Record<PlaybackStatus, string> = {
  completed: "Completed", playing: "In Progress", backlog: "Backlog", shelved: "Shelved",
};
