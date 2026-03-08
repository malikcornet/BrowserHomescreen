import type { FileSystemItemBase } from "../model/filesystem-item";
import {
  CONTEXT_MENU_TARGET_ATTR,
  CONTEXT_MENU_TARGETS,
  FILESYSTEM_ITEM_KIND_ATTR,
  FILESYSTEM_ITEM_NAME_ATTR,
} from "@features/programs";
import styles from "./FileSystemIcon.module.css";

type FileSystemIconProps = {
  fileSystemItem: FileSystemItemBase;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
  onScrollWheelClick?: React.MouseEventHandler<HTMLDivElement>;
};

function FileSystemIcon({
  fileSystemItem,
  onDoubleClick,
  onScrollWheelClick,
}: FileSystemIconProps) {
  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.button === 1) {
      // Prevent browser autoscroll so middle-click can trigger the custom action.
      event.preventDefault();
      onScrollWheelClick?.(event);
    }
  };

  return (
    <div
      className={styles.icon}
      {...{
        [CONTEXT_MENU_TARGET_ATTR]: CONTEXT_MENU_TARGETS.filesystemIcon,
        [FILESYSTEM_ITEM_KIND_ATTR]: fileSystemItem.kind,
        [FILESYSTEM_ITEM_NAME_ATTR]: fileSystemItem.name,
      }}
      onDoubleClick={onDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <img
        className={styles.iconImage}
        src={fileSystemItem.icon}
        alt={`${fileSystemItem.name} icon`}
      />
      <p className={styles.iconLabel}>{fileSystemItem.name}</p>
    </div>
  );
}

export default FileSystemIcon;