import { useCallback, useEffect, useMemo, useRef, type MouseEvent } from "react";
import type { DirectoryItem } from "@entities/filesystem/model";
import type { ResizeDirection, WindowRect } from "../Window";
import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH } from "../windowing/constants";
import { useWindowDrag, useWindowResize, useWindowZOrder, type FileExplorerWindow } from "../windowing";

type WindowCallbacks = {
  onClose: () => void;
  onFocus: () => void;
  onTitleBarMouseDown: (event: MouseEvent<HTMLElement>) => void;
  onResizeMouseDown: (direction: ResizeDirection, event: MouseEvent<HTMLButtonElement>) => void;
};

export type WindowViewModel = {
  id: number;
  title: string;
  frame: {
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
    isDragging: boolean;
  };
  callbacks: WindowCallbacks;
  directory: DirectoryItem;
  onDirectoryChange: (nextDirectory: DirectoryItem) => void;
};

type UseWindowManagerControllerArgs = {
  rootDirectory: DirectoryItem;
  initialWindows?: FileExplorerWindow[];
  onWindowsChange?: (windows: FileExplorerWindow[]) => void;
};

type RegionSize = {
  width: number;
  height: number;
};

const getExplorerTitle = (directory: DirectoryItem) => {
  return `File Explorer - ${directory.name}`;
};

const clampRectWithinRegion = (rect: WindowRect, regionSize: RegionSize): WindowRect => {
  const minWidth = Math.min(MIN_WINDOW_WIDTH, regionSize.width);
  const minHeight = Math.min(MIN_WINDOW_HEIGHT, regionSize.height);
  const width = Math.min(Math.max(minWidth, rect.width), regionSize.width);
  const height = Math.min(Math.max(minHeight, rect.height), regionSize.height);
  const x = Math.min(Math.max(0, rect.x), Math.max(0, regionSize.width - width));
  const y = Math.min(Math.max(0, rect.y), Math.max(0, regionSize.height - height));

  return { x, y, width, height };
};

type BuildWindowViewModelArgs = {
  windowItem: FileExplorerWindow;
  zIndex: number;
  draggingWindowId: number | null;
  closeWindow: (id: number) => void;
  focusWindow: (id: number) => void;
  handleTitleBarMouseDown: (id: number, event: MouseEvent<HTMLElement>) => void;
  handleResizeMouseDown: (id: number, direction: ResizeDirection, event: MouseEvent<HTMLButtonElement>) => void;
  updateFileExplorerDirectory: (id: number, directory: DirectoryItem) => void;
};

const buildWindowViewModel = ({
  windowItem,
  zIndex,
  draggingWindowId,
  closeWindow,
  focusWindow,
  handleTitleBarMouseDown,
  handleResizeMouseDown,
  updateFileExplorerDirectory,
}: BuildWindowViewModelArgs): WindowViewModel => {
  return {
    id: windowItem.id,
    title: getExplorerTitle(windowItem.directory),
    frame: {
      zIndex,
      position: { x: windowItem.rect.x, y: windowItem.rect.y },
      size: { width: windowItem.rect.width, height: windowItem.rect.height },
      isDragging: draggingWindowId === windowItem.id,
    },
    callbacks: {
      onClose: () => closeWindow(windowItem.id),
      onFocus: () => focusWindow(windowItem.id),
      onTitleBarMouseDown: (event) => handleTitleBarMouseDown(windowItem.id, event),
      onResizeMouseDown: (direction, event) => handleResizeMouseDown(windowItem.id, direction, event),
    },
    directory: windowItem.directory,
    onDirectoryChange: (nextDirectory) => updateFileExplorerDirectory(windowItem.id, nextDirectory),
  };
};

export function useWindowManagerController({
  rootDirectory,
  initialWindows,
  onWindowsChange,
}: UseWindowManagerControllerArgs) {
  const windowRegionRef = useRef<HTMLDivElement | null>(null);

  const getRegionSize = useCallback((): RegionSize | null => {
    const region = windowRegionRef.current;

    if (!region) {
      return null;
    }

    return {
      width: region.clientWidth,
      height: region.clientHeight,
    };
  }, []);

  const clampRectToRegion = useCallback((rect: WindowRect): WindowRect => {
    const regionSize = getRegionSize();

    if (!regionSize) {
      return rect;
    }

    return clampRectWithinRegion(rect, regionSize);
  }, [getRegionSize]);

  const {
    openWindows,
    openWindowsRef,
    openFileExplorer,
    closeWindow,
    focusWindow,
    updateWindowRect,
    updateFileExplorerDirectory,
    clampAllWindowsToViewport,
  } = useWindowZOrder({
    rootDirectory,
    clampRectToRegion,
    initialWindows,
  });

  const {
    draggingWindowId,
    handleTitleBarMouseDown,
    stopDragging,
  } = useWindowDrag({
    windowRegionRef,
    openWindowsRef,
    focusWindow,
    updateWindowRect,
  });

  const { handleResizeMouseDown } = useWindowResize({
    openWindowsRef,
    focusWindow,
    getRegionSize,
    updateWindowRect,
    stopDragging,
  });

  useEffect(() => {
    window.addEventListener("resize", clampAllWindowsToViewport);

    return () => {
      window.removeEventListener("resize", clampAllWindowsToViewport);
    };
  }, [clampAllWindowsToViewport]);

  useEffect(() => {
    onWindowsChange?.(openWindows);
  }, [onWindowsChange, openWindows]);

  const windowViewModels = useMemo<WindowViewModel[]>(() => {
    return openWindows.map((windowItem: FileExplorerWindow, index) =>
      buildWindowViewModel({
        windowItem,
        zIndex: index + 1,
        draggingWindowId,
        closeWindow,
        focusWindow,
        handleTitleBarMouseDown,
        handleResizeMouseDown,
        updateFileExplorerDirectory,
      }),
    );
  }, [
    closeWindow,
    draggingWindowId,
    focusWindow,
    handleResizeMouseDown,
    handleTitleBarMouseDown,
    openWindows,
    updateFileExplorerDirectory,
  ]);

  return {
    windowRegionRef,
    openFileExplorer,
    windowViewModels,
  };
}
