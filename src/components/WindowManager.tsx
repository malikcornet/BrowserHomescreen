import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { DirectoryItem } from "../models/directoryitem";
import styles from "./Desktop.module.css";
import Window, { type ResizeDirection, type WindowRect } from "./Window";
import FileExplorer from "./programs/FileExplorer";

type WindowManagerProps = {
  rootDirectory: DirectoryItem;
};

export type WindowManagerHandle = {
  openFileExplorer: (directory: DirectoryItem) => void;
};

type FileExplorerWindow = {
  id: number;
  directory: DirectoryItem;
  rect: WindowRect;
};

const MIN_WINDOW_WIDTH = 280;
const MIN_WINDOW_HEIGHT = 180;

const getExplorerTitle = (directory: DirectoryItem) => {
  return `File Explorer - ${directory.name}`;
};

const WindowManager = forwardRef<WindowManagerHandle, WindowManagerProps>(function WindowManager(
  { rootDirectory },
  ref,
) {
  const windowRegionRef = useRef<HTMLDivElement | null>(null);
  const nextWindowIdRef = useRef(2);
  const dragStateRef = useRef<{ windowId: number; offsetX: number; offsetY: number } | null>(null);
  const resizeStateRef = useRef<{
    windowId: number;
    direction: ResizeDirection;
    startMouseX: number;
    startMouseY: number;
    startRect: WindowRect;
  } | null>(null);

  const [draggingWindowId, setDraggingWindowId] = useState<number | null>(null);
  const [openWindows, setOpenWindows] = useState<FileExplorerWindow[]>([
    {
      id: 1,
      directory: rootDirectory,
      rect: { x: 24, y: 24, width: 420, height: 320 },
    },
  ]);

  const openWindowsRef = useRef(openWindows);

  useEffect(() => {
    openWindowsRef.current = openWindows;
  }, [openWindows]);

  const getRegionSize = () => {
    const region = windowRegionRef.current;

    if (!region) {
      return null;
    }

    return {
      width: region.clientWidth,
      height: region.clientHeight,
    };
  };

  const clampRectToRegion = (rect: WindowRect): WindowRect => {
    const regionSize = getRegionSize();

    if (!regionSize) {
      return rect;
    }

    const minWidth = Math.min(MIN_WINDOW_WIDTH, regionSize.width);
    const minHeight = Math.min(MIN_WINDOW_HEIGHT, regionSize.height);
    const width = Math.min(Math.max(minWidth, rect.width), regionSize.width);
    const height = Math.min(Math.max(minHeight, rect.height), regionSize.height);
    const x = Math.min(Math.max(0, rect.x), Math.max(0, regionSize.width - width));
    const y = Math.min(Math.max(0, rect.y), Math.max(0, regionSize.height - height));

    return { x, y, width, height };
  };

  const updateWindowRect = (id: number, updater: (currentRect: WindowRect) => WindowRect) => {
    setOpenWindows((currentWindows) =>
      currentWindows.map((windowItem) => {
        if (windowItem.id !== id) {
          return windowItem;
        }

        return {
          ...windowItem,
          rect: clampRectToRegion(updater(windowItem.rect)),
        };
      }),
    );
  };

  const openFileExplorer = (directory: DirectoryItem) => {
    const offset = openWindowsRef.current.length * 24;
    const newWindow: FileExplorerWindow = {
      id: nextWindowIdRef.current,
      directory,
      rect: clampRectToRegion({
        x: 24 + offset,
        y: 24 + offset,
        width: 420,
        height: 320,
      }),
    };

    nextWindowIdRef.current += 1;
    setOpenWindows((currentWindows) => [...currentWindows, newWindow]);
  };

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

  useImperativeHandle(ref, () => ({
    openFileExplorer,
  }));

  const closeWindow = (id: number) => {
    setOpenWindows((currentWindows) => currentWindows.filter((windowItem) => windowItem.id !== id));
  };

  const focusWindow = (id: number) => {
    setOpenWindows((currentWindows) => {
      const focusedWindow = currentWindows.find((windowItem) => windowItem.id === id);

      if (!focusedWindow) {
        return currentWindows;
      }

      return [
        ...currentWindows.filter((windowItem) => windowItem.id !== id),
        focusedWindow,
      ];
    });
  };

  const handleTitleBarMouseDown = (windowId: number, event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("button")) {
      return;
    }

    const regionRect = windowRegionRef.current?.getBoundingClientRect();
    const currentWindow = openWindowsRef.current.find((windowItem) => windowItem.id === windowId);

    if (!regionRect || !currentWindow) {
      return;
    }

    event.preventDefault();
    focusWindow(windowId);
    resizeStateRef.current = null;
    dragStateRef.current = {
      windowId,
      offsetX: event.clientX - regionRect.left - currentWindow.rect.x,
      offsetY: event.clientY - regionRect.top - currentWindow.rect.y,
    };
    setDraggingWindowId(windowId);
  };

  const handleResizeMouseDown = (
    windowId: number,
    direction: ResizeDirection,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    const currentWindow = openWindowsRef.current.find((windowItem) => windowItem.id === windowId);

    if (!currentWindow) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    focusWindow(windowId);
    dragStateRef.current = null;
    setDraggingWindowId(null);
    resizeStateRef.current = {
      windowId,
      direction,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startRect: currentWindow.rect,
    };
  };

  useEffect(() => {
    const handleMouseMove = (event: globalThis.MouseEvent) => {
      if (resizeStateRef.current) {
        const regionSize = getRegionSize();

        if (!regionSize) {
          return;
        }

        const {
          windowId,
          direction,
          startMouseX,
          startMouseY,
          startRect,
        } = resizeStateRef.current;

        const deltaX = event.clientX - startMouseX;
        const deltaY = event.clientY - startMouseY;

        const minWidth = Math.min(MIN_WINDOW_WIDTH, regionSize.width);
        const minHeight = Math.min(MIN_WINDOW_HEIGHT, regionSize.height);
        const startRight = startRect.x + startRect.width;
        const startBottom = startRect.y + startRect.height;

        let nextX = startRect.x;
        let nextY = startRect.y;
        let nextWidth = startRect.width;
        let nextHeight = startRect.height;

        if (direction.includes("e")) {
          nextWidth = Math.min(
            Math.max(minWidth, startRect.width + deltaX),
            regionSize.width - startRect.x,
          );
        }

        if (direction.includes("s")) {
          nextHeight = Math.min(
            Math.max(minHeight, startRect.height + deltaY),
            regionSize.height - startRect.y,
          );
        }

        if (direction.includes("w")) {
          const maxLeft = startRight - minWidth;
          nextX = Math.min(Math.max(0, startRect.x + deltaX), maxLeft);
          nextWidth = startRight - nextX;
        }

        if (direction.includes("n")) {
          const maxTop = startBottom - minHeight;
          nextY = Math.min(Math.max(0, startRect.y + deltaY), maxTop);
          nextHeight = startBottom - nextY;
        }

        updateWindowRect(windowId, () => ({
          x: nextX,
          y: nextY,
          width: nextWidth,
          height: nextHeight,
        }));

        return;
      }

      if (dragStateRef.current) {
        const regionRect = windowRegionRef.current?.getBoundingClientRect();
        const draggingWindow = openWindowsRef.current.find(
          (windowItem) => windowItem.id === dragStateRef.current?.windowId,
        );

        if (!regionRect || !draggingWindow) {
          return;
        }

        const nextX = event.clientX - regionRect.left - dragStateRef.current.offsetX;
        const nextY = event.clientY - regionRect.top - dragStateRef.current.offsetY;

        updateWindowRect(dragStateRef.current.windowId, (currentRect) => ({
          ...currentRect,
          x: nextX,
          y: nextY,
        }));
      }
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      resizeStateRef.current = null;
      setDraggingWindowId(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleViewportResize = () => {
      setOpenWindows((currentWindows) =>
        currentWindows.map((windowItem) => ({
          ...windowItem,
          rect: clampRectToRegion(windowItem.rect),
        })),
      );
    };

    window.addEventListener("resize", handleViewportResize);

    return () => {
      window.removeEventListener("resize", handleViewportResize);
    };
  }, []);

  return (
    <div ref={windowRegionRef} className={styles.windowRegion}>
      {openWindows.map((windowItem, index) => (
        <Window
          key={windowItem.id}
          title={getExplorerTitle(windowItem.directory)}
          frame={{
            zIndex: index + 1,
            position: { x: windowItem.rect.x, y: windowItem.rect.y },
            size: { width: windowItem.rect.width, height: windowItem.rect.height },
            isDragging: draggingWindowId === windowItem.id,
          }}
          callbacks={{
            onClose: () => closeWindow(windowItem.id),
            onFocus: () => focusWindow(windowItem.id),
            onTitleBarMouseDown: (event) => handleTitleBarMouseDown(windowItem.id, event),
            onResizeMouseDown: (direction, event) => handleResizeMouseDown(windowItem.id, direction, event),
          }}
        >
          <FileExplorer
            directoryItem={windowItem.directory}
            onDirectoryChange={(nextDirectory) => updateFileExplorerDirectory(windowItem.id, nextDirectory)}
          />
        </Window>
      ))}
    </div>
  );
});

export default WindowManager;
