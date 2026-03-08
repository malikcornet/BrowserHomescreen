import { useCallback, useEffect, useState, type MouseEvent } from "react";
import type { ContextMenuItem } from "@shared/ui";
import type {
  ProgramContextMenuRequest,
  ProgramSurfaceContextMenuHandler,
} from "../ProgramSurface.types";

type MenuState = {
  x: number;
  y: number;
  items: ContextMenuItem[];
};

type UseProgramContextMenuArgs = {
  getContextMenuItems?: (context: ProgramContextMenuRequest) => ContextMenuItem[];
};

export function useProgramContextMenu({ getContextMenuItems }: UseProgramContextMenuArgs) {
  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const hasContextMenu = Boolean(getContextMenuItems);

  const closeMenu = useCallback(() => {
    setMenuState(null);
  }, []);

  const handleContextMenu = useCallback<ProgramSurfaceContextMenuHandler>((event: MouseEvent<HTMLElement>) => {
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
  }, [getContextMenuItems]);

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
  }, [closeMenu, menuState]);

  return {
    menuState,
    hasContextMenu,
    closeMenu,
    handleContextMenu,
  };
}
