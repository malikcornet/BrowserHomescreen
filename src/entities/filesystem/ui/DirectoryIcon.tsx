import type { FileSystemItemBase } from "../model/filesystem-item";
import type { DirectoryItem } from "../model/directory-item";
import FileSystemIcon from "./FileSystemIcon";

type DirectoryIconProps = {
  directoryItem: DirectoryItem;
  onDoubleClick?: (directoryItem: DirectoryItem) => void;
  onScrollWheelClick?: React.MouseEventHandler<HTMLDivElement>;
  isEditing?: boolean;
  onEditingSubmit?: (nextName: string, item: FileSystemItemBase) => void;
  onEditingCancel?: (item: FileSystemItemBase) => void;
};

function DirectoryIcon({
  directoryItem,
  onDoubleClick,
  onScrollWheelClick,
  isEditing,
  onEditingSubmit,
  onEditingCancel,
}: DirectoryIconProps) {
  return (
    <FileSystemIcon
      fileSystemItem={directoryItem}
      onDoubleClick={() => onDoubleClick?.(directoryItem)}
      onScrollWheelClick={onScrollWheelClick}
      isEditing={isEditing}
      onEditingSubmit={onEditingSubmit}
      onEditingCancel={onEditingCancel}
    />
  );
}

export default DirectoryIcon;