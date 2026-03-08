import { findItemInDirectory, type DirectoryItem, type FileSystemItemBase } from "@entities/filesystem/model";
import type { ContextMenuItem } from "@shared/ui";
import { CONTEXT_MENU_LABEL } from "../context-menu.constants";
import type { FilesystemMenuTargetContext } from "./types";

type FilesystemMenuItemIds = {
  refresh: string;
  separatorPrimary: string;
  renameItem: string;
  deleteItem: string;
  newFolder: string;
  separatorSecondary: string;
  properties: string;
};

type BuildFilesystemContextMenuItemsArgs = {
  menuIds: FilesystemMenuItemIds;
  directory: DirectoryItem;
  targetContext: FilesystemMenuTargetContext;
  onStartRename: (item: FileSystemItemBase) => void;
  onCreateDirectory: () => void;
  getPropertiesLabel: () => string;
};

export const buildFilesystemContextMenuItems = ({
  menuIds,
  directory,
  targetContext,
  onStartRename,
  onCreateDirectory,
  getPropertiesLabel,
}: BuildFilesystemContextMenuItemsArgs): ContextMenuItem[] => {
  const { isIcon, itemName, itemKind } = targetContext;

  return [
    {
      id: menuIds.refresh,
      label: CONTEXT_MENU_LABEL.refresh,
      onSelect: () => {
        // Placeholder action; data is static for now.
      },
    },
    { id: menuIds.separatorPrimary, type: "separator" },
    ...(isIcon
      ? [
          {
            id: menuIds.renameItem,
            label: `${CONTEXT_MENU_LABEL.rename}${itemName ? ` ${itemName}` : ""}`,
            onSelect: () => {
              if (!itemName || !itemKind) {
                return;
              }

              const targetItem = findItemInDirectory(directory, itemName, itemKind);

              if (!targetItem) {
                return;
              }

              onStartRename(targetItem);
            },
          },
          {
            id: menuIds.deleteItem,
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
            id: menuIds.newFolder,
            label: CONTEXT_MENU_LABEL.newFolder,
            onSelect: onCreateDirectory,
          },
        ]),
    { id: menuIds.separatorSecondary, type: "separator" },
    {
      id: menuIds.properties,
      label: getPropertiesLabel(),
      onSelect: () => {
        // Future action once metadata views exist.
      },
      disabled: true,
    },
  ];
};
