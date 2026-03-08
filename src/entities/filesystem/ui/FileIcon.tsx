import type { FileSystemItemBase } from "../model/filesystem-item";
import type { FileItem } from "../model/file-item";
import { resolveFileUrl } from "../model/filesystem-utils";
import FileSystemIcon from "./FileSystemIcon";

type FileIconProps = {
  fileItem: FileItem;
  isEditing?: boolean;
  onEditingSubmit?: (nextName: string, item: FileSystemItemBase) => void;
  onEditingCancel?: (item: FileSystemItemBase) => void;
};

function FileIcon({ fileItem, isEditing, onEditingSubmit, onEditingCancel }: FileIconProps) {
  const handleDoubleClick = () => {
    window.location.href = resolveFileUrl(fileItem.url);
  };

  const handleScrollWheelClick = () => {
    window.open(resolveFileUrl(fileItem.url), "_blank", "noopener,noreferrer");
  };

  return (
    <FileSystemIcon
      fileSystemItem={fileItem}
      onDoubleClick={handleDoubleClick}
      onScrollWheelClick={handleScrollWheelClick}
      isEditing={isEditing}
      onEditingSubmit={onEditingSubmit}
      onEditingCancel={onEditingCancel}
    />
  );
}
  
export default FileIcon;