import {
  forwardRef,
  useImperativeHandle,
} from "react";
import type { DirectoryItem } from "@entities/filesystem/model";
import type { PersistedProgramState } from "@features/persistence";
import { FileExplorer } from "@features/programs/file-explorer";
import styles from "./WindowManager.module.css";
import Window from "./Window";
import { useWindowManagerController } from "./hooks/useWindowManagerController";
import type { FileExplorerWindow } from "./windowing";

type WindowManagerProps = {
  rootDirectory: DirectoryItem;
  initialWindows?: FileExplorerWindow[];
  onWindowsChange?: (windows: FileExplorerWindow[]) => void;
  onFilesystemChange?: () => void;
  fileExplorerProgramState?: PersistedProgramState;
  onFileExplorerProgramStateChange?: (nextState: PersistedProgramState) => void;
};

export type WindowManagerHandle = {
  openFileExplorer: (directory: DirectoryItem) => void;
};

const WindowManager = forwardRef<WindowManagerHandle, WindowManagerProps>(function WindowManager(
  {
    rootDirectory,
    initialWindows,
    onWindowsChange,
    onFilesystemChange,
    fileExplorerProgramState,
    onFileExplorerProgramStateChange,
  },
  ref,
) {
  const { windowRegionRef, openFileExplorer, windowViewModels } = useWindowManagerController({
    rootDirectory,
    initialWindows,
    onWindowsChange,
  });

  useImperativeHandle(
    ref,
    () => ({
      openFileExplorer,
    }),
    [openFileExplorer],
  );

  return (
    <div ref={windowRegionRef} className={styles.windowRegion}>
      {windowViewModels.map((windowItem) => (
        <Window
          key={windowItem.id}
          title={windowItem.title}
          frame={windowItem.frame}
          callbacks={windowItem.callbacks}
        >
          <FileExplorer
            directoryItem={windowItem.directory}
            rootDirectory={rootDirectory}
            onDirectoryChange={windowItem.onDirectoryChange}
            onFilesystemChange={onFilesystemChange}
            programState={fileExplorerProgramState}
            onProgramStateChange={onFileExplorerProgramStateChange}
          />
        </Window>
      ))}
    </div>
  );
});

export default WindowManager;
