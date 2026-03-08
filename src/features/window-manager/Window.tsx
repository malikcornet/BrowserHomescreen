import type { MouseEvent, PropsWithChildren } from "react";
import styles from "./Window.module.css";

export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type WindowRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WindowCallbacks = {
  onClose?: () => void;
  onFocus?: () => void;
  onTitleBarMouseDown?: (event: MouseEvent<HTMLElement>) => void;
  onResizeMouseDown?: (direction: ResizeDirection, event: MouseEvent<HTMLButtonElement>) => void;
};

const resizeDirections: ResizeDirection[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

type WindowProps = PropsWithChildren<{
  title?: string;
  className?: string;
  contentClassName?: string;
  frame: {
    zIndex?: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
    isDragging?: boolean;
  };
  callbacks?: WindowCallbacks;
}>;

function Window({
  title = "Window",
  className,
  contentClassName,
  frame,
  callbacks,
  children,
}: WindowProps) {
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
      className={rootClassName}
      role="dialog"
      aria-label={title}
      onMouseDown={callbacks?.onFocus}
      style={{
        left: `${frame.position.x}px`,
        top: `${frame.position.y}px`,
        width: `${frame.size.width}px`,
        height: `${frame.size.height}px`,
        zIndex: frame.zIndex,
      }}
    >
      <header
        className={[styles.titleBar, frame.isDragging ? styles.titleBarDragging : ""].join(" ")}
        onMouseDown={callbacks?.onTitleBarMouseDown}
      >
        <span className={styles.title}>{title}</span>
        <div className={styles.windowControls} aria-hidden>
          <button type="button" className={styles.controlButton}>
            _
          </button>
          <button type="button" className={styles.controlButton}>
            []
          </button>
          <button type="button" className={styles.controlButton} onClick={callbacks?.onClose}>
            X
          </button>
        </div>
      </header>
      <div className={bodyClassName}>{children}</div>
      {resizeDirections.map((direction) => (
        <button
          key={direction}
          type="button"
          className={[styles.resizeHandle, resizeHandleClassByDirection[direction]].join(" ")}
          onMouseDown={(event) => callbacks?.onResizeMouseDown?.(direction, event)}
          aria-label={`Resize ${direction}`}
          tabIndex={-1}
        />
      ))}
    </section>
  );
}

export default Window;