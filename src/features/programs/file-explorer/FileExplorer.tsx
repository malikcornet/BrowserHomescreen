import { useState } from "react";
import {
  createDirectoryIn,
  DirectoryItem,
  FileSystemItemBase,
  findItemInDirectory,
  renameItem,
} from "@entities/filesystem/model";
import { FileSystemItemGrid } from "@features/desktop";
import ProgramSurface, { type ProgramContextMenuRequest } from "../ProgramSurface";
import { CONTEXT_MENU_LABEL } from "../context-menu.constants";
import { getFilesystemIconContext } from "../context-menu-targets";
import type { ContextMenuItem } from "@shared/ui";
import programStyles from "../Program.module.css";
import styles from "./FileExplorer.module.css";

type FileExplorerProps = {
  directoryItem: DirectoryItem;
  onDirectoryChange?: (directory: DirectoryItem) => void;
  onFilesystemChange?: () => void;
};

const FILE_EXPLORER_MENU_ID = {
  refresh: "explorer-refresh",
  separatorPrimary: "explorer-separator-1",
  renameItem: "explorer-rename-item",
  deleteItem: "explorer-delete-item",
  newFolder: "explorer-new-folder",
  separatorSecondary: "explorer-separator-2",
  properties: "explorer-properties",
} as const;

function FileExplorer({ directoryItem, onDirectoryChange, onFilesystemChange }: FileExplorerProps) {
  const [editingItem, setEditingItem] = useState<FileSystemItemBase | null>(null);
  const [, bumpExplorerVersion] = useState(0);

  const handleEditingSubmit = (requestedName: string, item: FileSystemItemBase) => {
    const renamedItem = renameItem(directoryItem, item, requestedName);

    setEditingItem(null);

    if (renamedItem) {
      bumpExplorerVersion((currentVersion) => currentVersion + 1);
      onFilesystemChange?.();
    }
  };

  const handleEditingCancel = () => {
    setEditingItem(null);
  };

  const getFileExplorerMenuItems = (context: ProgramContextMenuRequest): ContextMenuItem[] => {
    const { isIcon, itemName, itemKind } = getFilesystemIconContext(context.targetElement);

    return [
      {
        id: FILE_EXPLORER_MENU_ID.refresh,
        label: CONTEXT_MENU_LABEL.refresh,
        onSelect: () => {
          // Placeholder action; data is static for now.
        },
      },
      { id: FILE_EXPLORER_MENU_ID.separatorPrimary, type: "separator" },
      ...(isIcon
        ? [
            {
              id: FILE_EXPLORER_MENU_ID.renameItem,
              label: `${CONTEXT_MENU_LABEL.rename}${itemName ? ` ${itemName}` : ""}`,
              onSelect: () => {
                if (!itemName || !itemKind) {
                  return;
                }

                const targetItem = findItemInDirectory(directoryItem, itemName, itemKind);

                if (!targetItem) {
                  return;
                }

                setEditingItem(targetItem);
              },
            },
            {
              id: FILE_EXPLORER_MENU_ID.deleteItem,
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
              id: FILE_EXPLORER_MENU_ID.newFolder,
              label: CONTEXT_MENU_LABEL.newFolder,
              onSelect: () => {
                const createdDirectory = createDirectoryIn(directoryItem);
                setEditingItem(createdDirectory);
                bumpExplorerVersion((currentVersion) => currentVersion + 1);
                onFilesystemChange?.();
              },
            },
          ]),
      { id: FILE_EXPLORER_MENU_ID.separatorSecondary, type: "separator" },
      {
        id: FILE_EXPLORER_MENU_ID.properties,
        label: `${CONTEXT_MENU_LABEL.properties} (${directoryItem.name})`,
        onSelect: () => {
          // Future action once explorer metadata view exists.
        },
        disabled: true,
      },
    ];
  };

  return (
    <ProgramSurface className={programStyles.programParent} getContextMenuItems={getFileExplorerMenuItems}>
      <div className={styles.childrenGrid}>
        <FileSystemItemGrid
          items={directoryItem.children}
          onDirectoryOpen={onDirectoryChange}
          editingItem={editingItem}
          onEditingSubmit={handleEditingSubmit}
          onEditingCancel={handleEditingCancel}
        />
      </div>
    </ProgramSurface>
  );
}

export default FileExplorer;