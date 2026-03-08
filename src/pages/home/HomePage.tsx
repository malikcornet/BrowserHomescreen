import { rootDirectory } from "@data";
import { Desktop } from "@features/desktop";
import { TaskBar } from "@features/taskbar";
import styles from "./HomePage.module.css";

function HomePage() {
  return (
    <div className={styles.homePage}>
      <Desktop rootDirectory={rootDirectory} />
      <TaskBar />
    </div>
  );
}

export default HomePage;