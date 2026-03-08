import {
  DirectoryItem,
  FileIcon,
  DirectoryIcon,
  getFileSystemItemKey,
  isDirectoryItem,
  isFileItem,
} from "@entities/filesystem";
import type { FileSystemItemBase } from "@entities/filesystem";

type FileSystemItemGridProps = {
  items: FileSystemItemBase[];
  onDirectoryOpen?: (directory: DirectoryItem) => void;
  editingItem?: FileSystemItemBase | null;
  onEditingSubmit?: (nextName: string, item: FileSystemItemBase) => void;
  onEditingCancel?: (item: FileSystemItemBase) => void;
};

function FileSystemItemGrid({
  items,
  onDirectoryOpen,
  editingItem,
  onEditingSubmit,
  onEditingCancel,
}: FileSystemItemGridProps) {
  return (
    <>
      {items.map((item, index) => {
        const isEditing = item === editingItem;

        if (isDirectoryItem(item)) {
          return (
            <DirectoryIcon
              key={getFileSystemItemKey(item, index)}
              directoryItem={item}
              onDoubleClick={onDirectoryOpen}
              isEditing={isEditing}
              onEditingSubmit={onEditingSubmit}
              onEditingCancel={onEditingCancel}
            />
          );
        }

        if (isFileItem(item)) {
          return (
            <FileIcon
              key={getFileSystemItemKey(item, index)}
              fileItem={item}
              isEditing={isEditing}
              onEditingSubmit={onEditingSubmit}
              onEditingCancel={onEditingCancel}
            />
          );
        }

        return null;
      })}
    </>
  );
}

export default FileSystemItemGrid;
