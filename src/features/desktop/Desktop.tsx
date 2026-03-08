import type { DirectoryItem } from "@entities/filesystem/model";
import styles from "./Desktop.module.css";
import FileSystemItemGrid from "./FileSystemItemGrid";
import { WindowManager } from "@features/window-manager";
import { ProgramSurface } from "@features/programs";
import type { FileExplorerWindow } from "@features/window-manager/windowing";
import { useDesktopController } from "./hooks/useDesktopController";

type DesktopProps = {
  rootDirectory: DirectoryItem;
  initialWindows?: FileExplorerWindow[];
  onFilesystemChange?: () => void;
  onWindowsChange?: (windows: FileExplorerWindow[]) => void;
};

function Desktop({
  rootDirectory,
  initialWindows,
  onFilesystemChange,
  onWindowsChange,
}: DesktopProps) {
  const {
    windowManagerRef,
    editingItem,
    buildDesktopMenuItems,
    handleDirectoryOpen,
    handleEditingSubmit,
    handleEditingCancel,
    handleFilesystemChange,
  } = useDesktopController({ rootDirectory, onFilesystemChange });

  return (
    <div className={styles.desktop}>
      <ProgramSurface className={styles.programSurface} getContextMenuItems={buildDesktopMenuItems}>
        <div className={styles.iconRegion}>
          <FileSystemItemGrid
            items={rootDirectory.children}
            onDirectoryOpen={handleDirectoryOpen}
            editingItem={editingItem}
            onEditingSubmit={handleEditingSubmit}
            onEditingCancel={handleEditingCancel}
          />
        </div>
        <div className={styles.activateWindowsWatermark} aria-hidden>
          <p className={styles.activateWindowsTitle}>Activate Windows</p>
          <p className={styles.activateWindowsSubtitle}>Go to Settings to activate Windows.</p>
        </div>
      </ProgramSurface>

      <WindowManager
        ref={windowManagerRef}
        rootDirectory={rootDirectory}
        initialWindows={initialWindows}
        onWindowsChange={onWindowsChange}
        onFilesystemChange={handleFilesystemChange}
      />
    </div>
  );
}

export default Desktop;