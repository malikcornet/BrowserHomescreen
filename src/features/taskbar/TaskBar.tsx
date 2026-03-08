import StartButton from "./StartButton";
import styles from "./TaskBar.module.css";

function TaskBar() {
  return (
    <div className={styles.taskbar} aria-label="Taskbar">
      <StartButton />
      <div className={styles.taskBand} aria-label="Taskbar content">
        {/* Future taskbar items will go here */}
      </div>
      <div className={styles.systemTray} aria-label="System Tray">
        {/* Future system tray icons will go here */}
      </div>
    </div>
  );
}

export default TaskBar;