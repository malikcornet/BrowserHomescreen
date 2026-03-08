import { DirectoryItem } from "@entities/filesystem/model";
import { FileSystemItemGrid } from "@features/desktop";
import programStyles from "../Program.module.css";
import styles from "./FileExplorer.module.css";

type FileExplorerProps = {
  directoryItem: DirectoryItem;
  onDirectoryChange?: (directory: DirectoryItem) => void;
};

function FileExplorer({ directoryItem, onDirectoryChange }: FileExplorerProps) {
  return (
    <div className={programStyles.programParent}>
      <div className={styles.childrenGrid}>
        <FileSystemItemGrid items={directoryItem.children} onDirectoryOpen={onDirectoryChange} />
      </div>
    </div>
  );
}

export default FileExplorer;