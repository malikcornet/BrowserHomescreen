import { useState } from "react";
import { DirectoryItem } from "../../models/directoryitem";
import { FileItem } from "../../models/fileitem";
import DirectoryIcon from "../icons/DirectoryIcon";
import FileIcon from "../icons/FileIcon";
import programStyles from "./Program.module.css";
import styles from "./FileExplorer.module.css";

function FileExplorer({directoryItem}: {directoryItem: DirectoryItem}) {
  const [currentDirectory, setCurrentDirectory] = useState(directoryItem);

  const handleDoubleClick = (clickedDirectory: DirectoryItem) => {
    setCurrentDirectory(clickedDirectory);
  };

  return (
    <div className={programStyles.programParent} >
      <div className={styles.childrenGrid}>
        {currentDirectory.Children.map((item, index) => {
          if (item instanceof DirectoryItem) {
            return <DirectoryIcon key={`dir-${item.name}-${index}`} directoryItem={item} onDoubleClick={handleDoubleClick}/>;
          }

          if (item instanceof FileItem) {
            return <FileIcon key={`file-${item.name}-${index}`} fileItem={item} />;
          }

          return null;
        })}
      </div>
    </div>
  );
}

export default FileExplorer;