import { useCallback, useState } from "react";
import {
  createFileIn,
  createDirectoryIn,
  removeItem,
  isDirectoryItem,
  updateFileUrl,
  type DirectoryItem,
  type FileItem,
  type FileSystemItemBase,
  renameItem,
} from "@entities/filesystem/model";

type UseFilesystemEditingArgs = {
  directory: DirectoryItem;
  onFilesystemChange?: () => void;
};

const findParentDirectoryForItem = (
  rootDirectory: DirectoryItem,
  targetItem: FileSystemItemBase,
): DirectoryItem | null => {
  if (rootDirectory.children.includes(targetItem)) {
    return rootDirectory;
  }

  for (const child of rootDirectory.children) {
    if (!isDirectoryItem(child)) {
      continue;
    }

    const foundParent = findParentDirectoryForItem(child, targetItem);

    if (foundParent) {
      return foundParent;
    }
  }

  return null;
};

export function useFilesystemEditing({ directory, onFilesystemChange }: UseFilesystemEditingArgs) {
  const [editingItem, setEditingItem] = useState<FileSystemItemBase | null>(null);
  const [, bumpVersion] = useState(0);

  const handleFilesystemChange = useCallback(() => {
    bumpVersion((currentVersion) => currentVersion + 1);
    onFilesystemChange?.();
  }, [onFilesystemChange]);

  const handleSubmitEditing = useCallback((requestedName: string, item: FileSystemItemBase) => {
    const parentDirectory = findParentDirectoryForItem(directory, item);

    if (!parentDirectory) {
      setEditingItem(null);
      return;
    }

    const renamedItem = renameItem(parentDirectory, item, requestedName);

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

  const handleCreateDirectoryAndEditIn = useCallback((parentDirectory: DirectoryItem) => {
    const createdDirectory = createDirectoryIn(parentDirectory);
    setEditingItem(createdDirectory);
    handleFilesystemChange();
  }, [handleFilesystemChange]);

  const handleCreateDirectoryAndEdit = useCallback(() => {
    handleCreateDirectoryAndEditIn(directory);
  }, [directory, handleCreateDirectoryAndEditIn]);

  const handleCreateFileAndEditIn = useCallback((parentDirectory: DirectoryItem) => {
    const createdFile = createFileIn(parentDirectory);
    setEditingItem(createdFile);
    handleFilesystemChange();
  }, [handleFilesystemChange]);

  const handleCreateFileAndEdit = useCallback(() => {
    handleCreateFileAndEditIn(directory);
  }, [directory, handleCreateFileAndEditIn]);

  const handleDeleteItem = useCallback((item: FileSystemItemBase) => {
    const parentDirectory = findParentDirectoryForItem(directory, item);

    if (!parentDirectory) {
      return;
    }

    const removedItem = removeItem(parentDirectory, item);

    if (!removedItem) {
      return;
    }

    setEditingItem((currentItem) => (currentItem === item ? null : currentItem));
    handleFilesystemChange();
  }, [directory, handleFilesystemChange]);

  const handleUpdateFileUrl = useCallback((item: FileItem, nextUrl: string) => {
    const parentDirectory = findParentDirectoryForItem(directory, item);

    if (!parentDirectory) {
      return;
    }

    const updatedFile = updateFileUrl(parentDirectory, item, nextUrl);

    if (!updatedFile) {
      return;
    }

    handleFilesystemChange();
  }, [directory, handleFilesystemChange]);

  return {
    editingItem,
    handleFilesystemChange,
    handleSubmitEditing,
    handleCancelEditing,
    handleStartEditing,
    handleCreateDirectoryAndEdit,
    handleCreateDirectoryAndEditIn,
    handleCreateFileAndEdit,
    handleCreateFileAndEditIn,
    handleDeleteItem,
    handleUpdateFileUrl,
  };
}
