import { DirectoryItem } from "../models/directoryitem";
import { FileItem } from "../models/fileitem";
import DirectoryIcon from "./icons/DirectoryIcon";
import FileIcon from "./icons/FileIcon";
import styles from "./Desktop.module.css";
import Window from "./Window";
import Terminal from "./programs/Terminal";
import FileExplorer from "./programs/FileExplorer";

type DesktopProps = {
  rootDirectory: DirectoryItem;
};

function Desktop({ rootDirectory }: DesktopProps) {
  return (
    <div className={styles.desktop}>
      <div className={styles.iconRegion}>
        {rootDirectory.Children.map((item, index) => {
          if (item instanceof DirectoryItem) {
            return <DirectoryIcon key={`dir-${item.name}-${index}`} directoryItem={item} />;
          } else if (item instanceof FileItem) {
            return <FileIcon key={`file-${item.name}-${index}`} fileItem={item} />;
          }

          return null;
        })}
      </div>
      <div className={styles.windowRegion}>
        <Window title="Welcome to the Desktop">
      <FileExplorer directoryItem={rootDirectory} />
        </Window>
        <Window title="Welcome to the Desktop">
<Terminal />
        </Window>
      </div>
    </div>
  );
}

export default Desktop;