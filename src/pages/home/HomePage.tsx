import { Desktop } from "@features/desktop";
import { FILE_EXPLORER_PROGRAM_ID, useDesktopPersistence, type PersistedProgramState } from "@features/persistence";
import { TaskBar } from "@features/taskbar";
import styles from "./HomePage.module.css";

function HomePage() {
  const {
    isReady,
    rootDirectory,
    initialWindows,
    handleFilesystemChange,
    handleWindowsChange,
    getProgramState,
    setProgramState,
  } = useDesktopPersistence();

  const fileExplorerProgramState = getProgramState(FILE_EXPLORER_PROGRAM_ID);

  const handleFileExplorerProgramStateChange = (nextState: PersistedProgramState) => {
    setProgramState(FILE_EXPLORER_PROGRAM_ID, nextState);
  };

  if (!isReady || !rootDirectory) {
    return <div className={styles.homePage} />;
  }

  return (
    <div className={styles.homePage}>
      <Desktop
        rootDirectory={rootDirectory}
        initialWindows={initialWindows}
        onFilesystemChange={handleFilesystemChange}
        onWindowsChange={handleWindowsChange}
        fileExplorerProgramState={fileExplorerProgramState}
        onFileExplorerProgramStateChange={handleFileExplorerProgramStateChange}
      />
      <TaskBar />
    </div>
  );
}

export default HomePage;