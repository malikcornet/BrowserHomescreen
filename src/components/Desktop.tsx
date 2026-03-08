import { DirectoryItem } from "../models/directoryitem";
import { FileItem } from "../models/fileitem";
import DirectoryIcon from "./icons/DirectoryIcon";
import FileIcon from "./icons/FileIcon";
import styles from "./Desktop.module.css";

type DesktopProps = {
  rootDirectory: DirectoryItem;
};

function Desktop({ rootDirectory }: DesktopProps) {
  return (
    <div className={styles.desktop}>
      {rootDirectory.Children.map((item, index) => {
        if (item instanceof DirectoryItem) {
          return <DirectoryIcon key={`dir-${item.name}-${index}`} directoryItem={item} />;
        } else if (item instanceof FileItem) {
          return <FileIcon key={`file-${item.name}-${index}`} fileItem={item} />;
        }

        return null;
      })}
    </div>
  );
}

export default Desktop;