import { useEffect, useMemo, useState, type MouseEvent, type PropsWithChildren } from "react";
import { ContextMenu, type ContextMenuItem } from "@shared/ui";

export type ProgramContextMenuRequest = {
  clientX: number;
  clientY: number;
  targetElement: HTMLElement | null;
  currentTargetElement: HTMLElement;
  target: EventTarget | null;
};

type ProgramSurfaceProps = PropsWithChildren<{
  className?: string;
  getContextMenuItems?: (context: ProgramContextMenuRequest) => ContextMenuItem[];
}>;

function ProgramSurface({ className, getContextMenuItems, children }: ProgramSurfaceProps) {
  const [menuState, setMenuState] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  const hasContextMenu = Boolean(getContextMenuItems);

  const closeMenu = () => {
    setMenuState(null);
  };

  const handleContextMenu = (event: MouseEvent<HTMLElement>) => {
    if (!getContextMenuItems) {
      return;
    }

    const items = getContextMenuItems({
      clientX: event.clientX,
      clientY: event.clientY,
      targetElement: event.target instanceof HTMLElement ? event.target : null,
      currentTargetElement: event.currentTarget,
      target: event.target,
    });

    if (items.length === 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setMenuState({
      x: event.clientX,
      y: event.clientY,
      items,
    });
  };

  useEffect(() => {
    if (!menuState) {
      return;
    }

    const handlePointerDown = () => {
      closeMenu();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuState]);

  const rootClassName = useMemo(() => [className].filter(Boolean).join(" "), [className]);

  return (
    <div className={rootClassName} onContextMenu={hasContextMenu ? handleContextMenu : undefined}>
      {children}
      {menuState ? (
        <ContextMenu
          position={{ x: menuState.x, y: menuState.y }}
          items={menuState.items}
          onClose={closeMenu}
        />
      ) : null}
    </div>
  );
}

export default ProgramSurface;
