import type { FileSystemItemBase } from "../../models/filesystemitem";
import styles from "./FileSystemIcon.module.css";

type FileSystemIconProps = {
  fileSystemItem: FileSystemItemBase;
};

function FileSystemIcon({ fileSystemItem }: FileSystemIconProps  ) {
  return (
    <div className={styles.icon}>
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