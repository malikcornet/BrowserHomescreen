import { useRef } from "react";
import { DirectoryItem } from "@entities/filesystem/model";
import type { ContextMenuItem } from "@shared/ui";
import styles from "./Desktop.module.css";
import FileSystemItemGrid from "./FileSystemItemGrid";
import { WindowManager, type WindowManagerHandle } from "@features/window-manager";
import { CONTEXT_MENU_LABEL, ProgramSurface, type ProgramContextMenuRequest } from "@features/programs";
import { getFilesystemIconContext } from "@features/programs/context-menu-targets";

type DesktopProps = {
  rootDirectory: DirectoryItem;
};

const DESKTOP_MENU_ID = {
  refresh: "desktop-refresh",
  separatorPrimary: "desktop-separator-1",
  deleteItem: "desktop-delete-item",
  newFolder: "desktop-new-folder",
  separatorSecondary: "desktop-separator-2",
  properties: "desktop-properties",
} as const;

function Desktop({ rootDirectory }: DesktopProps) {
  const windowManagerRef = useRef<WindowManagerHandle>(null);

  const getDesktopMenuItems = (context: ProgramContextMenuRequest): ContextMenuItem[] => {
    const { isIcon, itemName } = getFilesystemIconContext(context.targetElement);

    return [
      {
        id: DESKTOP_MENU_ID.refresh,
        label: CONTEXT_MENU_LABEL.refresh,
        onSelect: () => {
          // Placeholder action; data is static for now.
        },
      },
      { id: DESKTOP_MENU_ID.separatorPrimary, type: "separator" },
      ...(isIcon
        ? [
            {
              id: DESKTOP_MENU_ID.deleteItem,
              label: `${CONTEXT_MENU_LABEL.delete}${itemName ? ` ${itemName}` : ""}`,
              onSelect: () => {
                // Future action once filesystem mutability is implemented.
              },
              danger: true,
              disabled: true,
            },
          ]
        : [
            {
              id: DESKTOP_MENU_ID.newFolder,
              label: CONTEXT_MENU_LABEL.newFolder,
              onSelect: () => {
                // Future action once filesystem mutability is implemented.
              },
              disabled: true,
            },
          ]),
      { id: DESKTOP_MENU_ID.separatorSecondary, type: "separator" },
      {
        id: DESKTOP_MENU_ID.properties,
        label: CONTEXT_MENU_LABEL.properties,
        onSelect: () => {
          // Future action once desktop settings exist.
        },
        disabled: true,
      },
    ];
  };

  return (
    <div className={styles.desktop}>
      <ProgramSurface className={styles.programSurface} getContextMenuItems={getDesktopMenuItems}>
        <div className={styles.iconRegion}>
          <FileSystemItemGrid
            items={rootDirectory.children}
            onDirectoryOpen={(directory) => windowManagerRef.current?.openFileExplorer(directory)}
          />
        </div>
      </ProgramSurface>

      <WindowManager ref={windowManagerRef} rootDirectory={rootDirectory} />
    </div>
  );
}

export default Desktop;