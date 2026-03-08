import { useMemo } from "react";
import { ContextMenu } from "@shared/ui";
import { useProgramContextMenu } from "./hooks/useProgramContextMenu";
import type { ProgramSurfaceProps } from "./ProgramSurface.types";

export type { ProgramContextMenuRequest } from "./ProgramSurface.types";

function ProgramSurface({ className, getContextMenuItems, children }: ProgramSurfaceProps) {
  const { menuState, hasContextMenu, closeMenu, handleContextMenu } = useProgramContextMenu({
    getContextMenuItems,
  });

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
