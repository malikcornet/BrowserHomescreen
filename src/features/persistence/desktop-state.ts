import { DirectoryItem, FileItem, isDirectoryItem, isFileItem, type FileSystemItemBase } from "@entities/filesystem/model";
import type { FileExplorerWindow } from "@features/window-manager/windowing";
import { DESKTOP_STATE_STORAGE_KEY, FILE_EXPLORER_PROGRAM_ID, type PersistedDesktopState, type PersistedProgramWindowState, type SerializedDirectoryItem, type SerializedFilesystemItem } from "./types";
import { getIndexedDbValue, setIndexedDbValue } from "./indexeddb";

const FILE_EXPLORER_DIRECTORY_PATH_KEY = "directoryPath";

const serializeFilesystemItem = (item: FileSystemItemBase): SerializedFilesystemItem => {
  if (isDirectoryItem(item)) {
    return {
      kind: "directory",
      name: item.name,
      children: item.children.map((child) => serializeFilesystemItem(child)),
    };
  }

  if (isFileItem(item)) {
    return {
      kind: "file",
      name: item.name,
      url: item.url,
    };
  }

  return {
    kind: "file",
    name: item.name,
    url: "",
  };
};

const deserializeFilesystemItem = (item: SerializedFilesystemItem): FileSystemItemBase => {
  if (item.kind === "directory") {
    return new DirectoryItem(
      item.name,
      item.children.map((child) => deserializeFilesystemItem(child)),
    );
  }

  return new FileItem(item.name, item.url);
};

export const serializeDirectoryTree = (rootDirectory: DirectoryItem): SerializedDirectoryItem => {
  return {
    kind: "directory",
    name: rootDirectory.name,
    children: rootDirectory.children.map((child) => serializeFilesystemItem(child)),
  };
};

export const deserializeDirectoryTree = (serializedDirectory: SerializedDirectoryItem): DirectoryItem => {
  return new DirectoryItem(
    serializedDirectory.name,
    serializedDirectory.children.map((child) => deserializeFilesystemItem(child)),
  );
};

export const getDirectoryPath = (
  rootDirectory: DirectoryItem,
  targetDirectory: DirectoryItem,
): string[] | null => {
  if (rootDirectory === targetDirectory) {
    return [];
  }

  for (const child of rootDirectory.children) {
    if (!isDirectoryItem(child)) {
      continue;
    }

    const childPath = getDirectoryPath(child, targetDirectory);

    if (childPath) {
      return [child.name, ...childPath];
    }
  }

  return null;
};

export const getDirectoryByPath = (
  rootDirectory: DirectoryItem,
  pathSegments: string[],
): DirectoryItem | null => {
  let currentDirectory = rootDirectory;

  for (const pathSegment of pathSegments) {
    const nextDirectory = currentDirectory.children.find((child) => {
      return isDirectoryItem(child) && child.name === pathSegment;
    });

    if (!nextDirectory || !isDirectoryItem(nextDirectory)) {
      return null;
    }

    currentDirectory = nextDirectory;
  }

  return currentDirectory;
};

export const serializeFileExplorerWindows = (
  windows: FileExplorerWindow[],
  rootDirectory: DirectoryItem,
): PersistedProgramWindowState[] => {
  return windows.map((windowItem, index) => ({
    id: windowItem.id,
    zOrder: index,
    rect: windowItem.rect,
    state: {
      [FILE_EXPLORER_DIRECTORY_PATH_KEY]: getDirectoryPath(rootDirectory, windowItem.directory) ?? [],
    },
  }));
};

export const hydrateFileExplorerWindows = (
  persistedWindows: PersistedProgramWindowState[],
  rootDirectory: DirectoryItem,
): FileExplorerWindow[] => {
  return [...persistedWindows]
    .sort((windowA, windowB) => windowA.zOrder - windowB.zOrder)
    .map((windowItem) => {
      const persistedPath = windowItem.state[FILE_EXPLORER_DIRECTORY_PATH_KEY];
      const pathSegments = Array.isArray(persistedPath)
        ? persistedPath.filter((segment): segment is string => typeof segment === "string")
        : [];

      return {
        id: windowItem.id,
        directory: getDirectoryByPath(rootDirectory, pathSegments) ?? rootDirectory,
        rect: windowItem.rect,
      };
    });
};

export const loadPersistedDesktopState = async (): Promise<PersistedDesktopState | null> => {
  return getIndexedDbValue<PersistedDesktopState>(DESKTOP_STATE_STORAGE_KEY);
};

export const savePersistedDesktopState = async (state: PersistedDesktopState): Promise<void> => {
  await setIndexedDbValue(DESKTOP_STATE_STORAGE_KEY, state);
};

export const getPersistedFileExplorerWindows = (
  state: PersistedDesktopState,
): PersistedProgramWindowState[] => {
  const programState = state.programs[FILE_EXPLORER_PROGRAM_ID];

  if (!programState || !Array.isArray(programState.windows)) {
    return [];
  }

  return programState.windows;
};
