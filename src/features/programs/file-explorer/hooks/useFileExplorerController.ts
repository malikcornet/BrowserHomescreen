import { useCallback } from "react";
import type { DirectoryItem } from "@entities/filesystem/model";
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
  separatorSecondary: "explorer-separator-2",
  properties: "explorer-properties",
} as const;

type UseFileExplorerControllerArgs = {
  directoryItem: DirectoryItem;
  onFilesystemChange?: () => void;
};

export function useFileExplorerController({
  directoryItem,
  onFilesystemChange,
}: UseFileExplorerControllerArgs) {
  const {
    editingItem,
    handleSubmitEditing,
    handleCancelEditing,
    handleStartEditing,
    handleCreateDirectoryAndEdit,
  } = useFilesystemEditing({
    directory: directoryItem,
    onFilesystemChange,
  });

  const buildFileExplorerMenuItems = useCallback((context: ProgramContextMenuRequest): ContextMenuItem[] => {
    return buildFilesystemContextMenuItems({
      menuIds: FILE_EXPLORER_MENU_ID,
      directory: directoryItem,
      targetContext: getFilesystemIconContext(context.targetElement),
      onStartRename: handleStartEditing,
      onCreateDirectory: handleCreateDirectoryAndEdit,
      getPropertiesLabel: () => `Properties (${directoryItem.name})`,
    });
  }, [directoryItem, handleCreateDirectoryAndEdit, handleStartEditing]);

  return {
    editingItem,
    buildFileExplorerMenuItems,
    handleEditingSubmit: handleSubmitEditing,
    handleEditingCancel: handleCancelEditing,
  };
}
