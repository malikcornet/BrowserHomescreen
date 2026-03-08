import styles from "./StartButton.module.css";

function StartButton() {
  return (
    <button type="button" className={styles.startButton} aria-label="Open Start menu">
      <img
        className={styles.logo}
        src="src/assets/icons/windows.avif"
        alt="Start menu icon"
      />
      <span className={styles.label}>Start</span>
    </button>
  );
}

export default StartButton;