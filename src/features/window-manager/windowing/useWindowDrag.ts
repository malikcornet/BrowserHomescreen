import { useCallback, useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
import type { FileExplorerWindow } from "./types";
import type { WindowRect } from "../Window";

type DragState = {
  windowId: number;
  offsetX: number;
  offsetY: number;
};

type UseWindowDragArgs = {
  windowRegionRef: RefObject<HTMLDivElement | null>;
  openWindowsRef: RefObject<FileExplorerWindow[]>;
  focusWindow: (id: number) => void;
  updateWindowRect: (id: number, updater: (currentRect: WindowRect) => WindowRect) => void;
};

export function useWindowDrag({
  windowRegionRef,
  openWindowsRef,
  focusWindow,
  updateWindowRect,
}: UseWindowDragArgs) {
  const dragStateRef = useRef<DragState | null>(null);
  const [draggingWindowId, setDraggingWindowId] = useState<number | null>(null);

  const stopDragging = useCallback(() => {
    dragStateRef.current = null;
    setDraggingWindowId(null);
  }, []);

  const handleTitleBarMouseDown = useCallback((windowId: number, event: MouseEvent<HTMLElement>) => {
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
    dragStateRef.current = {
      windowId,
      offsetX: event.clientX - regionRect.left - currentWindow.rect.x,
      offsetY: event.clientY - regionRect.top - currentWindow.rect.y,
    };
    setDraggingWindowId(windowId);
  }, [focusWindow, openWindowsRef, windowRegionRef]);

  useEffect(() => {
    const handleMouseMove = (event: globalThis.MouseEvent) => {
      if (!dragStateRef.current) {
        return;
      }

      const regionRect = windowRegionRef.current?.getBoundingClientRect();

      if (!regionRect) {
        return;
      }

      const nextX = event.clientX - regionRect.left - dragStateRef.current.offsetX;
      const nextY = event.clientY - regionRect.top - dragStateRef.current.offsetY;

      updateWindowRect(dragStateRef.current.windowId, (currentRect) => ({
        ...currentRect,
        x: nextX,
        y: nextY,
      }));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [stopDragging, updateWindowRect, windowRegionRef]);

  return {
    draggingWindowId,
    handleTitleBarMouseDown,
    stopDragging,
  };
}
