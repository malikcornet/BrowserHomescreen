import { useCallback, useEffect, useRef, type MouseEvent, type RefObject } from "react";
import type { ResizeDirection, WindowRect } from "../Window";
import type { FileExplorerWindow } from "./types";
import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH } from "./constants";

type ResizeState = {
  windowId: number;
  direction: ResizeDirection;
  startMouseX: number;
  startMouseY: number;
  startRect: WindowRect;
};

type UseWindowResizeArgs = {
  openWindowsRef: RefObject<FileExplorerWindow[]>;
  focusWindow: (id: number) => void;
  getRegionSize: () => { width: number; height: number } | null;
  updateWindowRect: (id: number, updater: (currentRect: WindowRect) => WindowRect) => void;
  stopDragging: () => void;
};

export function useWindowResize({
  openWindowsRef,
  focusWindow,
  getRegionSize,
  updateWindowRect,
  stopDragging,
}: UseWindowResizeArgs) {
  const resizeStateRef = useRef<ResizeState | null>(null);

  const stopResizing = useCallback(() => {
    resizeStateRef.current = null;
  }, []);

  const handleResizeMouseDown = useCallback((
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
    stopDragging();
    resizeStateRef.current = {
      windowId,
      direction,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startRect: currentWindow.rect,
    };
  }, [focusWindow, openWindowsRef, stopDragging]);

  useEffect(() => {
    const handleMouseMove = (event: globalThis.MouseEvent) => {
      if (!resizeStateRef.current) {
        return;
      }

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
    };

    const handleMouseUp = () => {
      stopResizing();
      stopDragging();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [getRegionSize, stopDragging, stopResizing, updateWindowRect]);

  return {
    handleResizeMouseDown,
  };
}
