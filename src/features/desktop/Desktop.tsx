import { useRef, useState } from "react";
import {
  createDirectoryIn,
  DirectoryItem,
  FileSystemItemBase,
  findItemInDirectory,
  renameItem,
} from "@entities/filesystem/model";
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
  renameItem: "desktop-rename-item",
  deleteItem: "desktop-delete-item",
  newFolder: "desktop-new-folder",
  separatorSecondary: "desktop-separator-2",
  properties: "desktop-properties",
} as const;

function Desktop({ rootDirectory }: DesktopProps) {
  const windowManagerRef = useRef<WindowManagerHandle>(null);
  const [editingItem, setEditingItem] = useState<FileSystemItemBase | null>(null);
  const [, bumpFilesystemVersion] = useState(0);

  const notifyFilesystemChange = () => {
    bumpFilesystemVersion((currentVersion) => currentVersion + 1);
  };

  const handleEditingSubmit = (requestedName: string, item: FileSystemItemBase) => {
    const renamedItem = renameItem(rootDirectory, item, requestedName);

    setEditingItem(null);

    if (renamedItem) {
      notifyFilesystemChange();
    }
  };

  const handleEditingCancel = () => {
    setEditingItem(null);
  };

  const getDesktopMenuItems = (context: ProgramContextMenuRequest): ContextMenuItem[] => {
    const { isIcon, itemName, itemKind } = getFilesystemIconContext(context.targetElement);

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
              id: DESKTOP_MENU_ID.renameItem,
              label: `${CONTEXT_MENU_LABEL.rename}${itemName ? ` ${itemName}` : ""}`,
              onSelect: () => {
                if (!itemName || !itemKind) {
                  return;
                }

                const targetItem = findItemInDirectory(rootDirectory, itemName, itemKind);

                if (!targetItem) {
                  return;
                }

                setEditingItem(targetItem);
              },
            },
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
                const createdDirectory = createDirectoryIn(rootDirectory);
                setEditingItem(createdDirectory);
                notifyFilesystemChange();
              },
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
            editingItem={editingItem}
            onEditingSubmit={handleEditingSubmit}
            onEditingCancel={handleEditingCancel}
          />
        </div>
        <div className={styles.activateWindowsWatermark} aria-hidden>
          <p className={styles.activateWindowsTitle}>Activate Windows</p>
          <p className={styles.activateWindowsSubtitle}>Go to Settings to activate Windows.</p>
        </div>
      </ProgramSurface>

      <WindowManager
        ref={windowManagerRef}
        rootDirectory={rootDirectory}
        onFilesystemChange={notifyFilesystemChange}
      />
    </div>
  );
}

export default Desktop;