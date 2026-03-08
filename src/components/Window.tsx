import { useEffect, useRef, useState, type MouseEvent, type PropsWithChildren } from "react";
import styles from "./Window.module.css";

const MIN_WINDOW_WIDTH = 280;
const MIN_WINDOW_HEIGHT = 180;

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type WindowProps = PropsWithChildren<{
  title?: string;
  className?: string;
  contentClassName?: string;
}>;

function Window({
  title = "Window",
  className,
  contentClassName,
  children,
}: WindowProps) {
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [size, setSize] = useState({ width: 420, height: 320 });
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const windowRef = useRef<HTMLElement | null>(null);
  const positionRef = useRef(position);
  const sizeRef = useRef(size);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const getParentSize = () => {
    const parent = windowRef.current?.parentElement;

    if (!parent) {
      return null;
    }

    return {
      width: parent.clientWidth,
      height: parent.clientHeight,
    };
  };

  const clampWindowToParent = (x: number, y: number, width: number, height: number) => {
    const parentSize = getParentSize();

    if (!parentSize) {
      return { x, y, width, height };
    }

    const minWidth = Math.min(MIN_WINDOW_WIDTH, parentSize.width);
    const minHeight = Math.min(MIN_WINDOW_HEIGHT, parentSize.height);

    const clampedWidth = Math.min(Math.max(minWidth, width), parentSize.width);
    const clampedHeight = Math.min(Math.max(minHeight, height), parentSize.height);

    const maxX = Math.max(0, parentSize.width - clampedWidth);
    const maxY = Math.max(0, parentSize.height - clampedHeight);

    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
      width: clampedWidth,
      height: clampedHeight,
    };
  };

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    if (!isDragging && !resizeDirection) {
      return;
    }

    const handleMouseMove = (event: globalThis.MouseEvent) => {
      if (resizeDirection) {
        const parentSize = getParentSize();

        if (!parentSize) {
          return;
        }

        const deltaX = event.clientX - resizeStartRef.current.mouseX;
        const deltaY = event.clientY - resizeStartRef.current.mouseY;

        let nextX = resizeStartRef.current.x;
        let nextY = resizeStartRef.current.y;
        let nextWidth = resizeStartRef.current.width;
        let nextHeight = resizeStartRef.current.height;

        const minWidth = Math.min(MIN_WINDOW_WIDTH, parentSize.width);
        const minHeight = Math.min(MIN_WINDOW_HEIGHT, parentSize.height);
        const startRight = resizeStartRef.current.x + resizeStartRef.current.width;
        const startBottom = resizeStartRef.current.y + resizeStartRef.current.height;

        if (resizeDirection.includes("e")) {
          nextWidth = Math.min(
            Math.max(minWidth, resizeStartRef.current.width + deltaX),
            parentSize.width - resizeStartRef.current.x,
          );
        }

        if (resizeDirection.includes("s")) {
          nextHeight = Math.min(
            Math.max(minHeight, resizeStartRef.current.height + deltaY),
            parentSize.height - resizeStartRef.current.y,
          );
        }

        if (resizeDirection.includes("w")) {
          const maxLeft = startRight - minWidth;
          nextX = Math.min(Math.max(0, resizeStartRef.current.x + deltaX), maxLeft);
          nextWidth = startRight - nextX;
        }

        if (resizeDirection.includes("n")) {
          const maxTop = startBottom - minHeight;
          nextY = Math.min(Math.max(0, resizeStartRef.current.y + deltaY), maxTop);
          nextHeight = startBottom - nextY;
        }

        const clamped = clampWindowToParent(nextX, nextY, nextWidth, nextHeight);
        setPosition({ x: clamped.x, y: clamped.y });
        setSize({ width: clamped.width, height: clamped.height });
        return;
      }

      if (isDragging) {
        const windowEl = windowRef.current;
        const parentRect = windowEl?.parentElement?.getBoundingClientRect();

        if (!parentRect) {
          return;
        }

        const clamped = clampWindowToParent(
          event.clientX - parentRect.left - dragOffsetRef.current.x,
          event.clientY - parentRect.top - dragOffsetRef.current.y,
          sizeRef.current.width,
          sizeRef.current.height,
        );

        setPosition({ x: clamped.x, y: clamped.y });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setResizeDirection(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, resizeDirection]);

  useEffect(() => {
    const handleResize = () => {
      const clamped = clampWindowToParent(
        positionRef.current.x,
        positionRef.current.y,
        sizeRef.current.width,
        sizeRef.current.height,
      );

      setPosition({ x: clamped.x, y: clamped.y });
      setSize({ width: clamped.width, height: clamped.height });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleTitleBarMouseDown = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("button")) {
      return;
    }

    const windowRect = windowRef.current?.getBoundingClientRect();

    if (!windowRect) {
      return;
    }

    event.preventDefault();
    setResizeDirection(null);

    dragOffsetRef.current = {
      x: event.clientX - windowRect.left,
      y: event.clientY - windowRect.top,
    };

    setIsDragging(true);
  };

  const handleResizeMouseDown = (direction: ResizeDirection) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
    setResizeDirection(direction);

    resizeStartRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      x: positionRef.current.x,
      y: positionRef.current.y,
      width: sizeRef.current.width,
      height: sizeRef.current.height,
    };
  };

  const resizeHandleClassByDirection: Record<ResizeDirection, string> = {
    n: styles.resizeHandleN,
    s: styles.resizeHandleS,
    e: styles.resizeHandleE,
    w: styles.resizeHandleW,
    ne: styles.resizeHandleNE,
    nw: styles.resizeHandleNW,
    se: styles.resizeHandleSE,
    sw: styles.resizeHandleSW,
  };

  const rootClassName = [styles.window, className].filter(Boolean).join(" ");
  const bodyClassName = [styles.content, contentClassName].filter(Boolean).join(" ");

  return (
    <section
      ref={windowRef}
      className={rootClassName}
      role="dialog"
      aria-label={title}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      <header
        className={[styles.titleBar, isDragging ? styles.titleBarDragging : ""].join(" ")}
        onMouseDown={handleTitleBarMouseDown}
      >
        <span className={styles.title}>{title}</span>
        <div className={styles.windowControls} aria-hidden>
          <button type="button" className={styles.controlButton}>
            _
          </button>
          <button type="button" className={styles.controlButton}>
            []
          </button>
          <button type="button" className={styles.controlButton}>
            X
          </button>
        </div>
      </header>
      <div className={bodyClassName}>{children}</div>
      {(Object.keys(resizeHandleClassByDirection) as ResizeDirection[]).map((direction) => (
        <button
          key={direction}
          type="button"
          className={[styles.resizeHandle, resizeHandleClassByDirection[direction]].join(" ")}
          onMouseDown={handleResizeMouseDown(direction)}
          aria-label={`Resize ${direction}`}
          tabIndex={-1}
        />
      ))}
    </section>
  );
}

export default Window;