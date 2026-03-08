import { useCallback, useRef, useState } from "react";
import type { DirectoryItem, FileItem } from "@entities/filesystem/model";
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
  separatorEdit: "desktop-separator-edit",
  editFileUrl: "desktop-edit-file-url",
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
    handleCreateFileAndEditIn,
    handleDeleteItem,
    handleUpdateFileUrl,
  } = useFilesystemEditing({
    directory: rootDirectory,
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

  const buildDesktopMenuItems = useCallback((context: ProgramContextMenuRequest): ContextMenuItem[] => {
    return buildFilesystemContextMenuItems({
      menuIds: DESKTOP_MENU_ID,
      directory: rootDirectory,
      targetContext: getFilesystemIconContext(context.targetElement),
      onStartRename: handleStartEditing,
      onDeleteItem: handleDeleteItem,
      onCreateDirectory: handleCreateDirectoryAndEditIn,
      onCreateFile: handleCreateFileAndEditIn,
      onEditFileUrl: handleEditFileUrl,
    });
  }, [
    handleCreateDirectoryAndEditIn,
    handleCreateFileAndEditIn,
    handleDeleteItem,
    handleEditFileUrl,
    handleStartEditing,
    rootDirectory,
  ]);

  const handleDirectoryOpen = useCallback((directory: DirectoryItem) => {
    windowManagerRef.current?.openFileExplorer(directory);
  }, []);

  return {
    windowManagerRef,
    editingItem,
    fileUrlEditingItem,
    buildDesktopMenuItems,
    handleDirectoryOpen,
    handleEditingSubmit: handleSubmitEditing,
    handleEditingCancel: handleCancelEditing,
    handleCancelFileUrlEditing,
    handleSubmitFileUrlEditing,
    handleFilesystemChange,
  };
}
