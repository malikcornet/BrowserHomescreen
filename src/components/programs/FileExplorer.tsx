import { DirectoryItem } from "../../models/directoryitem";
import { FileItem } from "../../models/fileitem";
import DirectoryIcon from "../icons/DirectoryIcon";
import FileIcon from "../icons/FileIcon";
import programStyles from "./Program.module.css";
import styles from "./FileExplorer.module.css";

function FileExplorer({directoryItem}: {directoryItem: DirectoryItem}) {
  return (
    <div className={programStyles.programParent} >
      <div className={styles.childrenGrid}>
        {directoryItem.Children.map((item, index) => {
          if (item instanceof DirectoryItem) {
            return <DirectoryIcon key={`dir-${item.name}-${index}`} directoryItem={item} />;
          }

          if (item instanceof FileItem) {
            return <FileIcon key={`file-${item.name}-${index}`} fileItem={item} />;
          }

          return null;
        })}
      </div>
    </div>
  );
}

export default FileExplorer;