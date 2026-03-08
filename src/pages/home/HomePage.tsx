import { Desktop } from "@features/desktop";
import { useDesktopPersistence } from "@features/persistence";
import { TaskBar } from "@features/taskbar";
import styles from "./HomePage.module.css";

function HomePage() {
  const {
    isReady,
    rootDirectory,
    initialWindows,
    handleFilesystemChange,
    handleWindowsChange,
  } = useDesktopPersistence();

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
      />
      <TaskBar />
    </div>
  );
}

export default HomePage;