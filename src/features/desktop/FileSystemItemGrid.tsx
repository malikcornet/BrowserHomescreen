import {
  DirectoryItem,
  FileIcon,
  FileSystemItemBase,
  DirectoryIcon,
  getFileSystemItemKey,
  isDirectoryItem,
  isFileItem,
} from "@entities/filesystem";

type FileSystemItemGridProps = {
  items: FileSystemItemBase[];
  onDirectoryOpen?: (directory: DirectoryItem) => void;
};

function FileSystemItemGrid({ items, onDirectoryOpen }: FileSystemItemGridProps) {
  return (
    <>
      {items.map((item, index) => {
        if (isDirectoryItem(item)) {
          return (
            <DirectoryIcon
              key={getFileSystemItemKey(item, index)}
              directoryItem={item}
              onDoubleClick={onDirectoryOpen}
            />
          );
        }

        if (isFileItem(item)) {
          return <FileIcon key={getFileSystemItemKey(item, index)} fileItem={item} />;
        }

        return null;
      })}
    </>
  );
}

export default FileSystemItemGrid;
