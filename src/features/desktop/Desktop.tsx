import { useRef } from "react";
import { DirectoryItem } from "@entities/filesystem/model";
import styles from "./Desktop.module.css";
import FileSystemItemGrid from "./FileSystemItemGrid";
import { WindowManager, type WindowManagerHandle } from "@features/window-manager";

type DesktopProps = {
  rootDirectory: DirectoryItem;
};

function Desktop({ rootDirectory }: DesktopProps) {
  const windowManagerRef = useRef<WindowManagerHandle>(null);

  return (
    <div className={styles.desktop}>
      <div className={styles.iconRegion}>
        <FileSystemItemGrid
          items={rootDirectory.children}
          onDirectoryOpen={(directory) => windowManagerRef.current?.openFileExplorer(directory)}
        />
      </div>

      <WindowManager ref={windowManagerRef} rootDirectory={rootDirectory} />
    </div>
  );
}

export default Desktop;