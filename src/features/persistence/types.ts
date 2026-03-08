import type { WindowRect } from "@features/window-manager";

export const DESKTOP_STATE_VERSION = 1;
export const DESKTOP_STATE_STORAGE_KEY = "desktop-state";
export const FILE_EXPLORER_PROGRAM_ID = "file-explorer";

export type SerializedFileItem = {
  kind: "file";
  name: string;
  url: string;
};

export type SerializedDirectoryItem = {
  kind: "directory";
  name: string;
  children: SerializedFilesystemItem[];
};

export type SerializedFilesystemItem = SerializedDirectoryItem | SerializedFileItem;

export type PersistedProgramWindowState = {
  id: number;
  zOrder: number;
  rect: WindowRect;
  state: Record<string, unknown>;
};

export type PersistedProgramState = {
  windows?: PersistedProgramWindowState[];
  [key: string]: unknown;
};

export type PersistedDesktopState = {
  version: number;
  filesystem: SerializedDirectoryItem;
  programs: Record<string, PersistedProgramState>;
};
