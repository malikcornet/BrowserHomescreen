import type { FileItem } from "../model/file-item";
import { resolveFileUrl } from "../model/filesystem-utils";
import FileSystemIcon from "./FileSystemIcon";

type FileIconProps = {
  fileItem: FileItem;
};

function FileIcon({ fileItem }: FileIconProps) {
  const handleDoubleClick = () => {
    window.location.href = resolveFileUrl(fileItem.url);
  };

  const handleScrollWheelClick = () => {
    window.open(resolveFileUrl(fileItem.url), "_blank", "noopener,noreferrer");
  };

  return (
    <FileSystemIcon
      fileSystemItem={fileItem}
      onDoubleClick={handleDoubleClick}
      onScrollWheelClick={handleScrollWheelClick}
    />
  );
}
  
export default FileIcon;