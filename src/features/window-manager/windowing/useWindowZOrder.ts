import { useCallback, useEffect, useRef, useState } from "react";
import type { DirectoryItem } from "@entities/filesystem/model";
import type { WindowRect } from "../Window";
import { DEFAULT_WINDOW_RECT, WINDOW_CASCADE_OFFSET } from "./constants";
import type { FileExplorerWindow } from "./types";

const bringWindowToFront = (windows: FileExplorerWindow[], id: number): FileExplorerWindow[] => {
  const focusedWindow = windows.find((windowItem) => windowItem.id === id);

  if (!focusedWindow) {
    return windows;
  }

  return [...windows.filter((windowItem) => windowItem.id !== id), focusedWindow];
};

const updateWindowById = (
  windows: FileExplorerWindow[],
  id: number,
  updater: (windowItem: FileExplorerWindow) => FileExplorerWindow,
): FileExplorerWindow[] => {
  return windows.map((windowItem) => {
    if (windowItem.id !== id) {
      return windowItem;
    }

    return updater(windowItem);
  });
};

type UseWindowZOrderArgs = {
  rootDirectory: DirectoryItem;
  clampRectToRegion: (rect: WindowRect) => WindowRect;
  initialWindows?: FileExplorerWindow[];
};

const buildDefaultWindow = (rootDirectory: DirectoryItem): FileExplorerWindow => {
  return {
    id: 1,
    directory: rootDirectory,
    rect: DEFAULT_WINDOW_RECT,
  };
};

const getNextWindowId = (windows: FileExplorerWindow[] | undefined): number => {
  if (!windows || windows.length === 0) {
    return 2;
  }

  return Math.max(...windows.map((windowItem) => windowItem.id)) + 1;
};

export function useWindowZOrder({ rootDirectory, clampRectToRegion, initialWindows }: UseWindowZOrderArgs) {
  const nextWindowIdRef = useRef(getNextWindowId(initialWindows));
  const [openWindows, setOpenWindows] = useState<FileExplorerWindow[]>(() => {
    if (typeof initialWindows === "undefined") {
      return [buildDefaultWindow(rootDirectory)];
    }

    return initialWindows;
  });
  const openWindowsRef = useRef(openWindows);

  useEffect(() => {
    openWindowsRef.current = openWindows;
  }, [openWindows]);

  const openFileExplorer = useCallback((directory: DirectoryItem) => {
    const offset = openWindowsRef.current.length * WINDOW_CASCADE_OFFSET;
    const newWindow: FileExplorerWindow = {
      id: nextWindowIdRef.current,
      directory,
      rect: clampRectToRegion({
        x: DEFAULT_WINDOW_RECT.x + offset,
        y: DEFAULT_WINDOW_RECT.y + offset,
        width: DEFAULT_WINDOW_RECT.width,
        height: DEFAULT_WINDOW_RECT.height,
      }),
    };

    nextWindowIdRef.current += 1;
    setOpenWindows((currentWindows) => [...currentWindows, newWindow]);
  }, [clampRectToRegion]);

  const closeWindow = useCallback((id: number) => {
    setOpenWindows((currentWindows) => currentWindows.filter((windowItem) => windowItem.id !== id));
  }, []);

  const focusWindow = useCallback((id: number) => {
    setOpenWindows((currentWindows) => bringWindowToFront(currentWindows, id));
  }, []);

  const updateWindowRect = useCallback((id: number, updater: (currentRect: WindowRect) => WindowRect) => {
    setOpenWindows((currentWindows) =>
      updateWindowById(currentWindows, id, (windowItem) => ({
        ...windowItem,
        rect: clampRectToRegion(updater(windowItem.rect)),
      })),
    );
  }, [clampRectToRegion]);

  const updateFileExplorerDirectory = useCallback((id: number, directory: DirectoryItem) => {
    setOpenWindows((currentWindows) => {
      let changed = false;

      const nextWindows = currentWindows.map((windowItem) => {
        if (windowItem.id !== id || windowItem.directory === directory) {
          return windowItem;
        }

        changed = true;

        return {
          ...windowItem,
          directory,
        };
      });

      return changed ? nextWindows : currentWindows;
    });
  }, []);

  const clampAllWindowsToViewport = useCallback(() => {
    setOpenWindows((currentWindows) =>
      currentWindows.map((windowItem) => ({
        ...windowItem,
        rect: clampRectToRegion(windowItem.rect),
      })),
    );
  }, [clampRectToRegion]);

  return {
    openWindows,
    openWindowsRef,
    openFileExplorer,
    closeWindow,
    focusWindow,
    updateWindowRect,
    updateFileExplorerDirectory,
    clampAllWindowsToViewport,
  };
}
