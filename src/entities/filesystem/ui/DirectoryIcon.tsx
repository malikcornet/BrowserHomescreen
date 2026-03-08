import type { DirectoryItem } from "../model/directory-item";
import FileSystemIcon from "./FileSystemIcon";

type DirectoryIconProps = {
  directoryItem: DirectoryItem;
  onDoubleClick?: (directoryItem: DirectoryItem) => void;
  onScrollWheelClick?: React.MouseEventHandler<HTMLDivElement>;
};

function DirectoryIcon({ directoryItem, onDoubleClick, onScrollWheelClick }: DirectoryIconProps) {
  return (
    <FileSystemIcon
      fileSystemItem={directoryItem}
      onDoubleClick={() => onDoubleClick?.(directoryItem)}
      onScrollWheelClick={onScrollWheelClick}
    />
  );
}

export default DirectoryIcon;