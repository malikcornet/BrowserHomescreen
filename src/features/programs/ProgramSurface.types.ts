import type { MouseEvent, PropsWithChildren } from "react";
import type { ContextMenuItem } from "@shared/ui";

export type ProgramContextMenuRequest = {
  clientX: number;
  clientY: number;
  targetElement: HTMLElement | null;
  currentTargetElement: HTMLElement;
  target: EventTarget | null;
};

export type ProgramSurfaceProps = PropsWithChildren<{
  className?: string;
  getContextMenuItems?: (context: ProgramContextMenuRequest) => ContextMenuItem[];
}>;

export type ProgramSurfaceContextMenuHandler = (event: MouseEvent<HTMLElement>) => void;
