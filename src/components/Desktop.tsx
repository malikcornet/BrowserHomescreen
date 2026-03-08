import { DirectoryItem } from "../models/directoryitem";
import { useRef } from "react";
import { FileItem } from "../models/fileitem";
import DirectoryIcon from "./icons/DirectoryIcon";
import FileIcon from "./icons/FileIcon";
import styles from "./Desktop.module.css";
import WindowManager from "./WindowManager";
import type { WindowManagerHandle } from "./WindowManager";

type DesktopProps = {
  rootDirectory: DirectoryItem;
};

function Desktop({ rootDirectory }: DesktopProps) {
  const windowManagerRef = useRef<WindowManagerHandle>(null);

  return (
    <div className={styles.desktop}>
      <div className={styles.iconRegion}>
        {rootDirectory.Children.map((item, index) => {
          if (item instanceof DirectoryItem) {
            return (
              <DirectoryIcon
                key={`dir-${item.name}-${index}`}
                directoryItem={item}
                onDoubleClick={(directory) => windowManagerRef.current?.openFileExplorer(directory)}
              />
            );
          }

          if (item instanceof FileItem) {
            return <FileIcon key={`file-${item.name}-${index}`} fileItem={item} />;
          }

          return null;
        })}
      </div>

      <WindowManager ref={windowManagerRef} rootDirectory={rootDirectory} />
    </div>
  );
}

export default Desktop;