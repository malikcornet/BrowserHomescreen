import { useEffect, useRef } from "react";
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
  isEditing?: boolean;
  onEditingSubmit?: (nextName: string, item: FileSystemItemBase) => void;
  onEditingCancel?: (item: FileSystemItemBase) => void;
};

function FileSystemIcon({
  fileSystemItem,
  onDoubleClick,
  onScrollWheelClick,
  isEditing = false,
  onEditingSubmit,
  onEditingCancel,
}: FileSystemIconProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    // Focus and select text immediately to mimic desktop rename behavior.
    queueMicrotask(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [fileSystemItem.name, isEditing]);

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.button === 1) {
      // Prevent browser autoscroll so middle-click can trigger the custom action.
      event.preventDefault();
      onScrollWheelClick?.(event);
    }
  };

  const submitEdit = () => {
    onEditingSubmit?.(inputRef.current?.value ?? fileSystemItem.name, fileSystemItem);
  };

  const handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitEdit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onEditingCancel?.(fileSystemItem);
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
      {isEditing ? (
        <input
          ref={inputRef}
          className={styles.iconLabelInput}
          defaultValue={fileSystemItem.name}
          onBlur={submitEdit}
          onKeyDown={handleInputKeyDown}
          onMouseDown={(event) => event.stopPropagation()}
          aria-label={`Rename ${fileSystemItem.name}`}
        />
      ) : (
        <p className={styles.iconLabel}>{fileSystemItem.name}</p>
      )}
    </div>
  );
}

export default FileSystemIcon;