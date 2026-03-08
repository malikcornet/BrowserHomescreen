import { useCallback, useState } from "react";
import {
  createDirectoryIn,
  type DirectoryItem,
  type FileSystemItemBase,
  renameItem,
} from "@entities/filesystem/model";

type UseFilesystemEditingArgs = {
  directory: DirectoryItem;
  onFilesystemChange?: () => void;
};

export function useFilesystemEditing({ directory, onFilesystemChange }: UseFilesystemEditingArgs) {
  const [editingItem, setEditingItem] = useState<FileSystemItemBase | null>(null);
  const [, bumpVersion] = useState(0);

  const handleFilesystemChange = useCallback(() => {
    bumpVersion((currentVersion) => currentVersion + 1);
    onFilesystemChange?.();
  }, [onFilesystemChange]);

  const handleSubmitEditing = useCallback((requestedName: string, item: FileSystemItemBase) => {
    const renamedItem = renameItem(directory, item, requestedName);

    setEditingItem(null);

    if (renamedItem) {
      handleFilesystemChange();
    }
  }, [directory, handleFilesystemChange]);

  const handleCancelEditing = useCallback(() => {
    setEditingItem(null);
  }, []);

  const handleStartEditing = useCallback((item: FileSystemItemBase) => {
    setEditingItem(item);
  }, []);

  const handleCreateDirectoryAndEdit = useCallback(() => {
    const createdDirectory = createDirectoryIn(directory);
    setEditingItem(createdDirectory);
    handleFilesystemChange();
  }, [directory, handleFilesystemChange]);

  return {
    editingItem,
    handleFilesystemChange,
    handleSubmitEditing,
    handleCancelEditing,
    handleStartEditing,
    handleCreateDirectoryAndEdit,
  };
}
