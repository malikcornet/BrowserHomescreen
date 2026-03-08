import { useCallback, useState } from "react";
import {
  isDirectoryItem,
  type DirectoryItem,
  type FileItem,
  type FileSystemItemBase,
} from "@entities/filesystem/model";
import type { ContextMenuItem } from "@shared/ui";
import type { ProgramContextMenuRequest } from "@features/programs";
import { getFilesystemIconContext } from "@features/programs/context-menu-targets";
import { buildFilesystemContextMenuItems, useFilesystemEditing } from "@features/programs/filesystem";

const FILE_EXPLORER_MENU_ID = {
  refresh: "explorer-refresh",
  separatorPrimary: "explorer-separator-1",
  renameItem: "explorer-rename-item",
  deleteItem: "explorer-delete-item",
  newFolder: "explorer-new-folder",
  newFile: "explorer-new-file",
  separatorEdit: "explorer-separator-edit",
  editFileUrl: "explorer-edit-file-url",
} as const;

type UseFileExplorerControllerArgs = {
  directoryItem: DirectoryItem;
  rootDirectory?: DirectoryItem;
  onFilesystemChange?: () => void;
};

const resolveItemByPath = (
  rootDirectory: DirectoryItem,
  pathSegments: string[],
): FileSystemItemBase | null => {
  if (pathSegments.length === 0) {
    return rootDirectory;
  }

  let currentDirectory = rootDirectory;

  for (let index = 0; index < pathSegments.length; index += 1) {
    const segment = pathSegments[index];
    const nextItem = currentDirectory.children.find((child) => child.name === segment);

    if (!nextItem) {
      return null;
    }

    if (index === pathSegments.length - 1) {
      return nextItem;
    }

    if (!isDirectoryItem(nextItem)) {
      return null;
    }

    currentDirectory = nextItem;
  }

  return null;
};

export function useFileExplorerController({
  directoryItem,
  rootDirectory,
  onFilesystemChange,
}: UseFileExplorerControllerArgs) {
  const effectiveRootDirectory = rootDirectory ?? directoryItem;

  const {
    editingItem,
    handleSubmitEditing,
    handleCancelEditing,
    handleStartEditing,
    handleCreateDirectoryAndEditIn,
    handleCreateFileAndEditIn,
    handleDeleteItem,
    handleUpdateFileUrl,
  } = useFilesystemEditing({
    directory: effectiveRootDirectory,
    onFilesystemChange,
  });
  const [fileUrlEditingItem, setFileUrlEditingItem] = useState<FileItem | null>(null);

  const handleEditFileUrl = useCallback((item: FileItem) => {
    setFileUrlEditingItem(item);
  }, []);

  const handleCancelFileUrlEditing = useCallback(() => {
    setFileUrlEditingItem(null);
  }, []);

  const handleSubmitFileUrlEditing = useCallback((nextUrl: string) => {
    if (!fileUrlEditingItem) {
      return;
    }

    handleUpdateFileUrl(fileUrlEditingItem, nextUrl);
    setFileUrlEditingItem(null);
  }, [fileUrlEditingItem, handleUpdateFileUrl]);

  const buildFileExplorerMenuItems = useCallback((context: ProgramContextMenuRequest): ContextMenuItem[] => {
    const isDisabledZone = Boolean(
      context.targetElement?.closest("[data-context-menu-disabled='true']"),
    );

    if (isDisabledZone) {
      return [];
    }

    const targetContext = getFilesystemIconContext(context.targetElement);

    return buildFilesystemContextMenuItems({
      menuIds: FILE_EXPLORER_MENU_ID,
      directory: directoryItem,
      targetContext,
      onStartRename: handleStartEditing,
      onDeleteItem: handleDeleteItem,
      onCreateDirectory: handleCreateDirectoryAndEditIn,
      onCreateFile: handleCreateFileAndEditIn,
      onEditFileUrl: handleEditFileUrl,
      resolveTargetItem: (menuTargetContext) => {
        if (menuTargetContext.itemPath) {
          return resolveItemByPath(effectiveRootDirectory, menuTargetContext.itemPath);
        }

        if (!menuTargetContext.itemName || !menuTargetContext.itemKind) {
          return null;
        }

        return directoryItem.children.find((item) => {
          return item.name === menuTargetContext.itemName && item.kind === menuTargetContext.itemKind;
        }) ?? null;
      },
      isItemLocked: (item) => item === effectiveRootDirectory,
    });
  }, [
    directoryItem,
    effectiveRootDirectory,
    handleCreateDirectoryAndEditIn,
    handleCreateFileAndEditIn,
    handleDeleteItem,
    handleEditFileUrl,
    handleStartEditing,
  ]);

  return {
    editingItem,
    fileUrlEditingItem,
    buildFileExplorerMenuItems,
    handleEditingSubmit: handleSubmitEditing,
    handleEditingCancel: handleCancelEditing,
    handleCancelFileUrlEditing,
    handleSubmitFileUrlEditing,
  };
}
