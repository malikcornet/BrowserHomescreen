import type { FileItem } from "../../models/fileitem";
import FileSystemIcon from "./FileSystemIcon";

type FileIconProps = {
  fileItem: FileItem;
};

function FileIcon({ fileItem }: FileIconProps) {
  return <FileSystemIcon fileSystemItem={fileItem} />;
}
  
export default FileIcon;