import type { DirectoryItem } from "../../models/directoryitem";
import FileSystemIcon from "./FileSystemIcon";

type DirectoryIconProps = {
  directoryItem: DirectoryItem;
  onDoubleClick?: (directoryItem: DirectoryItem) => void;
  onScrollWheelClick?: React.MouseEventHandler<HTMLDivElement>;
};

function DirectoryIcon({ directoryItem, onDoubleClick, onScrollWheelClick }: DirectoryIconProps  ) {

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(directoryItem);
    }
  };

  const handleScrollWheelClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onScrollWheelClick) {
      onScrollWheelClick(event);
    }
  };


  return <FileSystemIcon fileSystemItem={directoryItem} onDoubleClick={handleDoubleClick} onScrollWheelClick={handleScrollWheelClick} />;
}

export default DirectoryIcon;