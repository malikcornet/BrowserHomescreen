import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { DirectoryItem } from "@entities/filesystem/model";
import { FileExplorer } from "@features/programs/file-explorer";
import styles from "./WindowManager.module.css";
import Window, { type WindowRect } from "./Window";
import { useWindowDrag, useWindowResize, useWindowZOrder } from "./windowing";

type WindowManagerProps = {
  rootDirectory: DirectoryItem;
  onFilesystemChange?: () => void;
};

export type WindowManagerHandle = {
  openFileExplorer: (directory: DirectoryItem) => void;
};

const MIN_WINDOW_WIDTH = 280;
const MIN_WINDOW_HEIGHT = 180;

const getExplorerTitle = (directory: DirectoryItem) => {
  return `File Explorer - ${directory.name}`;
};

const WindowManager = forwardRef<WindowManagerHandle, WindowManagerProps>(function WindowManager(
  { rootDirectory, onFilesystemChange },
  ref,
) {
  const windowRegionRef = useRef<HTMLDivElement | null>(null);

  const getRegionSize = useCallback(() => {
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

    const minWidth = Math.min(MIN_WINDOW_WIDTH, regionSize.width);
    const minHeight = Math.min(MIN_WINDOW_HEIGHT, regionSize.height);
    const width = Math.min(Math.max(minWidth, rect.width), regionSize.width);
    const height = Math.min(Math.max(minHeight, rect.height), regionSize.height);
    const x = Math.min(Math.max(0, rect.x), Math.max(0, regionSize.width - width));
    const y = Math.min(Math.max(0, rect.y), Math.max(0, regionSize.height - height));

    return { x, y, width, height };
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

  useImperativeHandle(
    ref,
    () => ({
      openFileExplorer,
    }),
    [openFileExplorer],
  );

  useEffect(() => {
    window.addEventListener("resize", clampAllWindowsToViewport);

    return () => {
      window.removeEventListener("resize", clampAllWindowsToViewport);
    };
  }, [clampAllWindowsToViewport]);

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
            onFilesystemChange={onFilesystemChange}
          />
        </Window>
      ))}
    </div>
  );
});

export default WindowManager;
