import { useCallback, useRef } from "react";
import type { DirectoryItem } from "@entities/filesystem/model";
import type { ContextMenuItem } from "@shared/ui";
import type { WindowManagerHandle } from "@features/window-manager";
import type { ProgramContextMenuRequest } from "@features/programs";
import { getFilesystemIconContext } from "@features/programs/context-menu-targets";
import { buildFilesystemContextMenuItems, useFilesystemEditing } from "@features/programs/filesystem";

const DESKTOP_MENU_ID = {
  refresh: "desktop-refresh",
  separatorPrimary: "desktop-separator-1",
  renameItem: "desktop-rename-item",
  deleteItem: "desktop-delete-item",
  newFolder: "desktop-new-folder",
  newFile: "desktop-new-file",
} as const;

type UseDesktopControllerArgs = {
  rootDirectory: DirectoryItem;
  onFilesystemChange?: () => void;
};

export function useDesktopController({ rootDirectory, onFilesystemChange }: UseDesktopControllerArgs) {
  const windowManagerRef = useRef<WindowManagerHandle>(null);
  const {
    editingItem,
    handleFilesystemChange,
    handleSubmitEditing,
    handleCancelEditing,
    handleStartEditing,
    handleCreateDirectoryAndEditIn,
    handleDeleteItem,
  } = useFilesystemEditing({
    directory: rootDirectory,
    onFilesystemChange,
  });

  const buildDesktopMenuItems = useCallback((context: ProgramContextMenuRequest): ContextMenuItem[] => {
    return buildFilesystemContextMenuItems({
      menuIds: DESKTOP_MENU_ID,
      directory: rootDirectory,
      targetContext: getFilesystemIconContext(context.targetElement),
      onStartRename: handleStartEditing,
      onDeleteItem: handleDeleteItem,
      onCreateDirectory: handleCreateDirectoryAndEditIn,
    });
  }, [handleCreateDirectoryAndEditIn, handleDeleteItem, handleStartEditing, rootDirectory]);

  const handleDirectoryOpen = useCallback((directory: DirectoryItem) => {
    windowManagerRef.current?.openFileExplorer(directory);
  }, []);

  return {
    windowManagerRef,
    editingItem,
    buildDesktopMenuItems,
    handleDirectoryOpen,
    handleEditingSubmit: handleSubmitEditing,
    handleEditingCancel: handleCancelEditing,
    handleFilesystemChange,
  };
}
