import styles from "./StartButton.module.css";
import windowsIcon from "../assets/icons/windows.avif";

function StartButton() {
  return (
    <button type="button" className={styles.startButton} aria-label="Open Start menu">
      <img
        className={styles.logo}
        src={windowsIcon}
        alt="Start menu icon"
      />
      <span className={styles.label}>Start</span>
    </button>
  );
}

export default StartButton;