import { useCallback, useEffect, useRef, useState } from "react";
import type { DirectoryItem } from "@entities/filesystem/model";
import type { WindowRect } from "../Window";
import type { FileExplorerWindow } from "./types";

const WINDOW_CASCADE_OFFSET = 24;
const DEFAULT_WINDOW_RECT: WindowRect = {
  x: 24,
  y: 24,
  width: 420,
  height: 320,
};

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
};

export function useWindowZOrder({ rootDirectory, clampRectToRegion }: UseWindowZOrderArgs) {
  const nextWindowIdRef = useRef(2);
  const [openWindows, setOpenWindows] = useState<FileExplorerWindow[]>([
    {
      id: 1,
      directory: rootDirectory,
      rect: DEFAULT_WINDOW_RECT,
    },
  ]);
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
