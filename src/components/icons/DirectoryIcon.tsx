import type { DirectoryItem } from "../../models/directoryitem";
import FileSystemIcon from "./FileSystemIcon";

type DirectoryIconProps = {
  directoryItem: DirectoryItem;
};

function DirectoryIcon({ directoryItem }: DirectoryIconProps  ) {
  return <FileSystemIcon fileSystemItem={directoryItem} />;
}

export default DirectoryIcon;