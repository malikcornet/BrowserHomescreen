import {
  findItemInDirectory,
  isDirectoryItem,
  isFileItem,
  type DirectoryItem,
  type FileItem,
  type FileSystemItemBase,
} from "@entities/filesystem/model";
import type { ContextMenuItem } from "@shared/ui";
import { CONTEXT_MENU_LABEL } from "../context-menu.constants";
import type { FilesystemMenuTargetContext } from "./types";

type FilesystemMenuItemIds = {
  refresh: string;
  separatorPrimary: string;
  renameItem: string;
  deleteItem: string;
  newFolder: string;
  newFile: string;
  separatorEdit?: string;
  editFileUrl?: string;
};

type BuildFilesystemContextMenuItemsArgs = {
  menuIds: FilesystemMenuItemIds;
  directory: DirectoryItem;
  targetContext: FilesystemMenuTargetContext;
  onStartRename: (item: FileSystemItemBase) => void;
  onDeleteItem: (item: FileSystemItemBase) => void;
  onCreateDirectory: (parentDirectory: DirectoryItem) => void;
  onCreateFile?: (parentDirectory: DirectoryItem) => void;
  onEditFileUrl?: (item: FileItem) => void;
  resolveTargetItem?: (context: FilesystemMenuTargetContext) => FileSystemItemBase | null;
  isItemLocked?: (item: FileSystemItemBase) => boolean;
};

export const buildFilesystemContextMenuItems = ({
  menuIds,
  directory,
  targetContext,
  onStartRename,
  onDeleteItem,
  onCreateDirectory,
  onCreateFile,
  onEditFileUrl,
  resolveTargetItem,
  isItemLocked,
}: BuildFilesystemContextMenuItemsArgs): ContextMenuItem[] => {
  const { isIcon, itemName, itemKind } = targetContext;
  const targetItem = resolveTargetItem
    ? resolveTargetItem(targetContext)
    : itemName && itemKind
      ? findItemInDirectory(directory, itemName, itemKind)
      : null;
  const isTargetLocked = Boolean(targetItem && isItemLocked?.(targetItem));
  const isFileTarget = Boolean(targetItem && isFileItem(targetItem));
  const directoryTarget = targetItem && isDirectoryItem(targetItem) ? targetItem : null;
  const isDirectoryTarget = Boolean(directoryTarget);
  const createParentDirectory = directoryTarget ?? directory;

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
              if (!targetItem) {
                return;
              }

              onStartRename(targetItem);
            },
            disabled: isTargetLocked,
          },
          {
            id: menuIds.deleteItem,
            label: `${CONTEXT_MENU_LABEL.delete}${itemName ? ` ${itemName}` : ""}`,
            onSelect: () => {
              if (!targetItem) {
                return;
              }

              onDeleteItem(targetItem);
            },
            danger: true,
            disabled: isTargetLocked,
          },
          ...(isDirectoryTarget
            ? [
                {
                  id: `${menuIds.newFolder}-target`,
                  label: CONTEXT_MENU_LABEL.newFolder,
                  onSelect: () => onCreateDirectory(createParentDirectory),
                },
                ...(onCreateFile
                  ? [
                      {
                        id: `${menuIds.newFile}-target`,
                        label: CONTEXT_MENU_LABEL.newFile,
                        onSelect: () => onCreateFile(createParentDirectory),
                      },
                    ]
                  : []),
              ]
            : []),
          ...(isFileTarget && onEditFileUrl && menuIds.separatorEdit && menuIds.editFileUrl
            ? [
                { id: menuIds.separatorEdit, type: "separator" as const },
                {
                  id: menuIds.editFileUrl,
                  label: CONTEXT_MENU_LABEL.editUrl,
                  onSelect: () => {
                    if (!targetItem || !isFileItem(targetItem)) {
                      return;
                    }

                    onEditFileUrl(targetItem);
                  },
                },
              ]
            : []),
        ]
      : [
          {
            id: menuIds.newFolder,
            label: CONTEXT_MENU_LABEL.newFolder,
            onSelect: () => onCreateDirectory(directory),
          },
          ...(onCreateFile
            ? [
                {
                  id: menuIds.newFile,
                  label: CONTEXT_MENU_LABEL.newFile,
                  onSelect: () => onCreateFile(directory),
                },
              ]
            : []),
        ]),
  ];
};
